import { env } from "cloudflare:workers";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Use the website form." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Please try again shortly." }, { status: 503 });
  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 1000) throw new Error("Too large");
    data = JSON.parse(raw);
  } catch { return Response.json({ error: "Please check your details." }, { status: 400 }); }
  if (data?.website) return Response.json({ ok: true });
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  await env.DB.prepare('INSERT INTO privacy_requests (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING').bind(email, new Date().toISOString()).run();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
