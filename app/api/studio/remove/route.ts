import { env } from "cloudflare:workers";
import { isStudioOwner } from "../../../../lib/studio-auth";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!(await isStudioOwner())) return new Response("Not authorised", { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Invalid origin", { status: 403 });
  if (!env.DB) return new Response("List unavailable", { status: 503 });
  const form = await request.formData();
  const email = form.get("email");
  if (typeof email !== "string" || email.length > 254) return new Response("Invalid request", { status: 400 });
  // The studio fulfils a subscriber's recorded removal request.
  const pending = await env.DB.prepare("SELECT email FROM privacy_requests WHERE email = ?").bind(email).first();
  if (!pending) return new Response("No removal request found", { status: 400 });
  await env.DB.batch([env.DB.prepare("DELETE FROM release_list WHERE email = ?").bind(email), env.DB.prepare("DELETE FROM privacy_requests WHERE email = ?").bind(email)]);
  return new Response(null, { status: 303, headers: { Location: "/studio", "Cache-Control": "no-store" } });
}
