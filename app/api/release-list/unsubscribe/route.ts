import { env } from "cloudflare:workers";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Use the website form." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Please try again shortly." }, { status: 503 });
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof data?.token !== "string" || !/^[0-9a-f-]{36}$/i.test(data.token)) return Response.json({ error: "Use the unsubscribe link from your release update." }, { status: 400 });
  await env.DB.prepare("DELETE FROM release_list WHERE unsubscribe_token = ?").bind(data.token).run();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
