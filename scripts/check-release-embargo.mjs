import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

// Public assets are intentionally allowlisted. The owner approved Collection 01
// garment previews; the complete manufacturing board and technical pack stay private.
const allowed = new Set(["assets/entrance.webp", "assets/social.jpg", "assets/logo.jpg", "assets/texture-study.webp", "assets/embroidery-study.webp", "favicon.png"]);
// The seven editorial photographs supplied for this website update are public.
for (const name of ["material-black-yellow", "material-ivory-indigo", "material-petrol-ice", "emblem-study", "embroidery-detail", "studio-notes", "first-notice"]) {
  allowed.add(`assets/${name}.webp`);
  allowed.add(`assets/${name}-560.webp`);
}
// Front-only design previews extracted from the owner-supplied board.
for (const colour of ["black-yellow", "ivory-indigo", "petrol-ice"]) {
  allowed.add(`assets/collection-01-${colour}.svg`);
}
// Public campaign details for the owner's ELSEWHERE denim teaser.
for (const width of [640, 1120]) {
  allowed.add(`assets/elsewhere-night-study-${width}.webp`);
}
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
console.log("Release embargo passed: only approved brand assets, editorial photographs and front-only garment previews are public.");
