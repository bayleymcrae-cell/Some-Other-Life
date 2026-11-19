import { env } from "cloudflare:workers";
import { colourways, sizes } from "../../../lib/collection";

export const dynamic = "force-dynamic";
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!env.DB) return json({ error: "The release list is temporarily unavailable. Please try again shortly." }, 503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Please submit through the website." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Please use the release form." }, 415);
  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 3000) return json({ error: "Please check your details." }, 400);
    input = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid form");
  } catch { return json({ error: "Please check your details." }, 400); }
  if (input.website) return json({ ok: true });
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const colourway = typeof input.colourway === "string" ? input.colourway : "undecided";
  const size = typeof input.size === "string" ? input.size : "undecided";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || /[\r\n\x00]/.test(email)) return json({ error: "Enter a valid email address." }, 400);
  if (![...colourways.map(c => c.id), "undecided"].includes(colourway)) return json({ error: "Choose one of the colourways." }, 400);
  if (!(sizes as readonly string[]).includes(size)) return json({ error: "Choose a preferred size." }, 400);
  if (input.consent !== true) return json({ error: "Please agree to receive release updates." }, 400);
  try {
    const ip = request.headers.get("cf-connecting-ip");
    if (ip) {
      const bucket = Math.floor(Date.now() / 3600000);
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:sol-release:${bucket}`));
      const key = Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2, "0")).join("");
      const result = await env.DB.prepare('INSERT INTO release_limits (key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(key, Date.now() + 3600000).first<{ attempts: number }>();
      if (result && result.attempts > 10) return json({ error: "Too many attempts. Please try again in an hour." }, 429);
      await env.DB.prepare('DELETE FROM release_limits WHERE expires_at < ?').bind(Date.now()).run();
    }
    await env.DB.prepare('INSERT INTO release_list (id, email, colourway, preferred_size, consent_version, created_at, unsubscribe_token) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING')
      .bind(crypto.randomUUID(), email, colourway, size, "release-updates-2026-11", new Date().toISOString(), crypto.randomUUID()).run();
    return json({ ok: true });
  } catch (error) {
    console.error("Release list write failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Your details haven’t been saved. Please try again shortly." }, 503);
  }
}
