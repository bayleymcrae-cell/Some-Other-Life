import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "../chatgpt-auth";
import { isStudioOwner } from "../../lib/studio-auth";
export const dynamic = "force-dynamic";
export default async function Studio() {
  await requireChatGPTUser("/studio");
  if (!(await isStudioOwner())) return <main className="studio-page"><p>Some Other Life</p><h1>This space is private.</h1><a href="/">Return to the collection</a></main>;
  let rows: { email: string; colourway: string; preferred_size: string; created_at: string }[] = [];
  let available = true;
  try {
    if (!env.DB) throw new Error("Database not connected");
    const result = await env.DB.prepare("SELECT email, colourway, preferred_size, created_at FROM release_list ORDER BY created_at DESC LIMIT 500").all<(typeof rows)[number]>();
    rows = result.results;
  } catch { available = false; }
  const total = available && env.DB ? await env.DB.prepare("SELECT COUNT(*) AS count FROM release_list").first<{ count: number }>() : null;
  const requests = available && env.DB ? await env.DB.prepare("SELECT email, created_at FROM privacy_requests ORDER BY created_at ASC LIMIT 500").all<{ email: string; created_at: string }>() : null;
  return <main className="studio-page"><a href="/">← Some Other Life</a><p className="eyebrow">PRIVATE STUDIO</p><h1>The release list.</h1><p>{available ? `${total?.count ?? 0} registered for Collection 01.` : "The release list is temporarily unavailable."}</p><p>Subscribers and their preferences are visible only to your account. This page shows the latest 500 registrations. The CSV contains the full list. Registrations are saved here; this website does not send email automatically.</p>{available && <a className="button button-dark" href="/api/studio/export">Download release list ↗</a>}{!!requests?.results.length && <section><h2>Removal requests</h2><div className="studio-table"><table><thead><tr><th>Email</th><th>Requested (AEST)</th><th>Action</th></tr></thead><tbody>{requests.results.map(r => <tr key={r.email}><td>{r.email}</td><td>{new Date(r.created_at).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}</td><td><form action="/api/studio/remove" method="post"><input type="hidden" name="email" value={r.email} /><button className="text-link" type="submit">Fulfil removal request</button></form></td></tr>)}</tbody></table></div></section>}<div className="studio-table"><table><thead><tr><th>Email</th><th>Preferred size</th><th>Joined (AEST)</th></tr></thead><tbody>{rows.map(r => <tr key={r.email}><td>{r.email}</td><td>{r.preferred_size}</td><td>{new Date(r.created_at).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}</td></tr>)}</tbody></table>{available && !rows.length && <p>No registrations yet.</p>}</div></main>;
}
