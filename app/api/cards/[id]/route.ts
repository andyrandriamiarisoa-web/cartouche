import { NextResponse } from "next/server";
import { isValidCardId } from "@/lib/id";
import { deleteCard } from "@/lib/server/store";

export const runtime = "nodejs";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!originAllowed(request)) {
    return jsonError(403, "Origine non autorisée.");
  }

  const { id } = await params;
  if (!isValidCardId(id)) {
    return jsonError(400, "Identifiant invalide.");
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return jsonError(401, "Jeton de propriété manquant.");
  }

  try {
    const result = await deleteCard(id, token);
    switch (result) {
      case "deleted":
        return new NextResponse(null, { status: 204 });
      case "not_found":
        return jsonError(404, "Carte introuvable.");
      case "forbidden":
        return jsonError(403, "Ce jeton ne permet pas de supprimer cette carte.");
      case "unconfigured":
        return jsonError(503, "Le stockage n'est pas configuré.");
    }
  } catch {
    return jsonError(500, "La suppression a échoué, réessayez dans un instant.");
  }
}
