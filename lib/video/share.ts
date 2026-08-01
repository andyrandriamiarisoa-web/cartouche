"use client";

export type VideoShareOutcome = "shared" | "downloaded" | "cancelled";

function videoFile(blob: Blob, title: string): File {
  // Un nom de fichier propre : c'est ce que verra le destinataire s'il l'enregistre.
  const slug =
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .toLowerCase() || "carte";
  return new File([blob], `cartouche-${slug}.mp4`, { type: "video/mp4" });
}

/** Le partage de fichiers n'existe pas partout : on le demande avant de promettre. */
export function canShareVideoFile(blob?: Blob): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [videoFile(blob ?? new Blob(), "test")] });
  } catch {
    return false;
  }
}

/**
 * Remet la vidéo au téléphone, qui propose WhatsApp comme n'importe quelle autre
 * application. À défaut, on la télécharge : l'expéditeur la joindra à la main.
 *
 * À appeler directement depuis un clic : iOS exige un geste récent, et
 * l'encodage a duré bien trop longtemps pour que celui du départ compte encore.
 */
export async function shareVideo(
  blob: Blob,
  { title, text }: { title: string; text: string }
): Promise<VideoShareOutcome> {
  const file = videoFile(blob, title);

  if (canShareVideoFile(blob)) {
    try {
      await navigator.share({ files: [file], title, text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Partage refusé par le système : le téléchargement reste une sortie.
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return "downloaded";
}
