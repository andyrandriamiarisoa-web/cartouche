import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const blob = vi.hoisted(() => ({
  head: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  list: vi.fn(),
}));

vi.mock("@vercel/blob", () => blob);

const { streamCardMedia } = await import("@/lib/server/store");

const CARD_ID = "abcdefgh1234";
const BLOB_URL = `https://store123.private.blob.vercel-storage.com/cards/${CARD_ID}/audio.wav`;
const TOKEN = "vercel_blob_rw_store123_secret";

/** Réponse du blob, telle que la verrait la fonction. */
function upstream(
  status: number,
  headers: Record<string, string> = {},
  body: string | null = "les octets"
): Response {
  return new Response(status === 304 || status === 416 ? null : body, {
    status,
    headers,
  });
}

function request(headers: Record<string, string> = {}): Request {
  return new Request(`https://exemple.test/c/${CARD_ID}/audio.wav`, { headers });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = TOKEN;
  blob.head.mockReset().mockResolvedValue({ url: BLOB_URL });
  fetchMock = vi.fn().mockResolvedValue(upstream(200, { "content-length": "10" }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("relais des médias depuis le store privé", () => {
  it("s'authentifie auprès du blob et sert le contenu au navigateur", async () => {
    const response = await streamCardMedia(CARD_ID, "audio", request());

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(BLOB_URL);
    expect(new Headers(init.headers).get("authorization")).toBe(`Bearer ${TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/wav");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(await response.text()).toBe("les octets");
  });

  it("annonce le bon type pour la photo", async () => {
    const response = await streamCardMedia(CARD_ID, "photo", request());
    expect(response.headers.get("content-type")).toBe("image/jpeg");
  });

  /**
   * Sans cela, iOS refuse de lire l'audio et le déplacement dans
   * l'enregistrement ne fonctionne pas : c'est la raison d'être du relais.
   */
  it("transmet la requête par plage et renvoie bien un 206", async () => {
    fetchMock.mockResolvedValue(
      upstream(206, { "content-range": "bytes 0-9/2048", "content-length": "10" }, "0123456789")
    );

    const response = await streamCardMedia(
      CARD_ID,
      "audio",
      request({ Range: "bytes=0-9" })
    );

    const sent = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(sent.get("range")).toBe("bytes=0-9");
    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-9/2048");
  });

  it("relaie la validation de cache sans corps", async () => {
    fetchMock.mockResolvedValue(upstream(304, { etag: '"abc"' }));

    const response = await streamCardMedia(
      CARD_ID,
      "audio",
      request({ "If-None-Match": '"abc"' })
    );

    const sent = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(sent.get("if-none-match")).toBe('"abc"');
    expect(response.status).toBe(304);
    expect(response.body).toBeNull();
  });

  it("relaie une plage invalide plutôt que de la maquiller", async () => {
    fetchMock.mockResolvedValue(upstream(416));
    const response = await streamCardMedia(
      CARD_ID,
      "audio",
      request({ Range: "bytes=99999999-" })
    );
    expect(response.status).toBe(416);
  });

  it("répond 404 quand le média n'existe pas ou plus", async () => {
    blob.head.mockRejectedValue(new Error("Blob not found"));
    const response = await streamCardMedia(CARD_ID, "audio", request());
    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("répond 404 sur une panne du stockage, sans propager l'erreur", async () => {
    fetchMock.mockResolvedValue(upstream(500));
    const response = await streamCardMedia(CARD_ID, "audio", request());
    expect(response.status).toBe(404);
  });

  it("répond 404 quand le stockage est injoignable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const response = await streamCardMedia(CARD_ID, "audio", request());
    expect(response.status).toBe(404);
  });

  it("rejette un identifiant qui n'a pas la forme d'une carte", async () => {
    const response = await streamCardMedia("../../secret", "audio", request());
    expect(response.status).toBe(404);
    expect(blob.head).not.toHaveBeenCalled();
  });

  it("ne tente rien sans stockage configuré", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const response = await streamCardMedia(CARD_ID, "audio", request());
    expect(response.status).toBe(404);
    expect(blob.head).not.toHaveBeenCalled();
  });

  /** L'URL interne du blob ne doit jamais transparaître dans la réponse. */
  it("ne divulgue pas l'URL du blob", async () => {
    const response = await streamCardMedia(CARD_ID, "audio", request());
    const exposed = [...response.headers.values()].join(" ");
    expect(exposed).not.toContain("blob.vercel-storage.com");
    expect(exposed).not.toContain(TOKEN);
  });
});
