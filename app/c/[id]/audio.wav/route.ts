import { streamCardMedia } from "@/lib/server/store";

export const runtime = "nodejs";

/**
 * L'enregistrement d'une carte. Le store étant privé, c'est l'application qui
 * relaie les octets : le lien reste public et sans compte, mais le fichier
 * n'existe nulle part ailleurs que derrière cette route.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return streamCardMedia(id, "audio", request);
}
