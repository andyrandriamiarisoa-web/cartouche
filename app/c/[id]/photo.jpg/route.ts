import { streamCardMedia } from "@/lib/server/store";

export const runtime = "nodejs";

/** La photo choisie par l'expéditeur, relayée depuis le store privé. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  return streamCardMedia(id, "photo", request);
}
