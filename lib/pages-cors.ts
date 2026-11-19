// GitHub Pages serves the original public experience. Its public forms continue
// to use this Site's existing database; Studio endpoints are never exposed here.
const pageOrigins = new Set([
  "https://someotherlife.studio",
  "https://www.someotherlife.studio",
  "https://bayleymcrae-cell.github.io",
]);
const publicForms = new Set([
  "/api/release-list",
  "/api/release-list/unsubscribe",
  "/api/privacy-request",
]);

export function pagesFormRequest(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (!publicForms.has(url.pathname) || !origin || !pageOrigins.has(origin)) {
    return { request, origin: null, preflight: null };
  }
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };
  if (request.method === "OPTIONS") {
    return { request, origin, preflight: new Response(null, { status: 204, headers: corsHeaders }) };
  }
  if (request.method !== "POST") return { request, origin: null, preflight: null };
  const headers = new Headers(request.headers);
  headers.set("Origin", url.origin);
  return { request: new Request(request, { headers }), origin, preflight: null };
}

export function pagesFormResponse(response: Response, origin: string | null) {
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.append("Vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
