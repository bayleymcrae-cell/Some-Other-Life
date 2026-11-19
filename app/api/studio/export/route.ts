import { env } from "cloudflare:workers";
import { isStudioOwner } from "../../../../lib/studio-auth";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isStudioOwner())) return new Response("Not authorised", { status: 403 });
  if (!env.DB) return new Response("List unavailable", { status: 503 });
  const data = await env.DB.prepare("SELECT email, colourway, preferred_size, created_at, consent_version, unsubscribe_token FROM release_list ORDER BY created_at DESC").all<Record<string, string>>();
  const quote = (value: string) => `"${String(value ?? "").replace(/^[=+\-@\t\r]/, "'$&").replaceAll('"', '""')}"`;
  const columns = ["email", "colourway", "preferred_size", "created_at", "consent_version", "unsubscribe_token"];
  const csv = [columns.join(","), ...data.results.map(row => columns.map(c => quote(row[c])).join(","))].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="some-other-life-release-list.csv"', "Cache-Control": "private, no-store" } });
}
