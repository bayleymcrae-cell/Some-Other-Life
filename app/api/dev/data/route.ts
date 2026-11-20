import { env } from "cloudflare:workers";
import { isStudioOwner } from "../../../../lib/studio-auth";

export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "application/json; charset=utf-8" };
const EMPTY = { version: 1, brand: "SOME OTHER LIFE", sourceEmail: "someotherlifetm@gmail.com", packVersion: "REV B — 16 NOV 2026", suppliers: [], activity: [], globalNotes: [] };
async function workspaceDB() {
  if (!env.DB) throw new Error("D1 binding unavailable");
  // Isolated from customer release-list tables. Created only by the authenticated owner route.
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS supplier_studio_workspace (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
  return env.DB;
}
export async function GET() {
  if (!(await isStudioOwner())) return new Response(JSON.stringify({error:"Forbidden"}),{status:403,headers:PRIVATE_HEADERS});
  try {
    const db=await workspaceDB();
    const row=await db.prepare("SELECT payload FROM supplier_studio_workspace WHERE id=?").bind("collection-01").first<{payload:string}>();
    return new Response(row?.payload??JSON.stringify(EMPTY),{headers:PRIVATE_HEADERS});
  } catch {
    return new Response(JSON.stringify({error:"Private database unavailable"}),{status:503,headers:PRIVATE_HEADERS});
  }
}
export async function PUT(request: Request) {
  if (!(await isStudioOwner())) return new Response(JSON.stringify({error:"Forbidden"}),{status:403,headers:PRIVATE_HEADERS});
  const origin=request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return new Response(JSON.stringify({error:"Origin rejected"}),{status:403,headers:PRIVATE_HEADERS});
  if (!request.headers.get("content-type")?.startsWith("application/json")) return new Response(JSON.stringify({error:"JSON only"}),{status:415,headers:PRIVATE_HEADERS});
  if (Number(request.headers.get("content-length")||0)>1000000) return new Response(JSON.stringify({error:"Data too large"}),{status:413,headers:PRIVATE_HEADERS});
  const body=await request.text();
  if (body.length>1000000) return new Response(JSON.stringify({error:"Data too large"}),{status:413,headers:PRIVATE_HEADERS});
  let parsed: unknown;
  try { parsed=JSON.parse(body); } catch { return new Response(JSON.stringify({error:"Invalid JSON"}),{status:400,headers:PRIVATE_HEADERS}); }
  if (!parsed || typeof parsed!=="object" || !("suppliers" in parsed) || !Array.isArray((parsed as {suppliers: unknown}).suppliers) || (parsed as {suppliers:unknown[]}).suppliers.length>500) return new Response(JSON.stringify({error:"Invalid supplier workspace"}),{status:400,headers:PRIVATE_HEADERS});
  for(const item of (parsed as {suppliers:unknown[]}).suppliers){
    if(!item||typeof item!=="object"||typeof (item as {id?:unknown}).id!=="string"||typeof (item as {name?:unknown}).name!=="string")return new Response(JSON.stringify({error:"Invalid supplier row"}),{status:400,headers:PRIVATE_HEADERS});
  }
  try {
    const db=await workspaceDB();
    await db.prepare("INSERT INTO supplier_studio_workspace (id,payload,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at").bind("collection-01",body,new Date().toISOString()).run();
    return new Response(JSON.stringify({saved:true}),{headers:PRIVATE_HEADERS});
  } catch { return new Response(JSON.stringify({error:"Save failed"}),{status:503,headers:PRIVATE_HEADERS}); }
}
