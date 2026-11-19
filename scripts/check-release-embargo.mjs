import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

// Collection 01 stays unrevealed. Any new public file needs an intentional
// review; adding a blurred copy must not accidentally ship its original.
const allowed = new Set(["assets/entrance.webp", "assets/social.jpg", "assets/logo.jpg", "assets/texture-study.webp", "assets/embroidery-study.webp", "favicon.png"]);
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(entries.map(entry => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]));
  return results.flat();
}
const found = (await files("public")).map(path => relative("public", path).replaceAll("\\", "/"));
const unexpected = found.filter(path => !allowed.has(path));
const missing = [...allowed].filter(path => !found.includes(path));
if (unexpected.length || missing.length) {
  throw new Error(`Release embargo audit failed. Unexpected: ${unexpected.join(", ") || "none"}; missing: ${missing.join(", ") || "none"}`);
}
console.log("Release embargo passed: only the approved architecture, logo, two cropped detail studies and brand graphics are public.");
