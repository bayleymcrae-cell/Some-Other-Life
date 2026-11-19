import { build, mergeConfig } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import config from "../github-pages/vite.config.mjs";

await build(config);
await build(mergeConfig(config, {
  publicDir: false,
  build: { ssr: "prerender.tsx", outDir: "../dist/pages-prerender", manifest: false },
}));
const { pages } = await import("../dist/pages-prerender/prerender.js");
const shell = await readFile("dist/pages/index.html", "utf8");
for (const [path, markup] of Object.entries(pages)) {
  const directory = `dist/pages${path === "/" ? "" : path}`;
  await mkdir(directory, { recursive: true });
  const html = shell.replace("<!--original-page-->", markup)
    .replace('rel="canonical" href="https://someotherlife.studio/"', `rel="canonical" href="https://someotherlife.studio${path}"`);
  await writeFile(`${directory}/index.html`, html);
}
await mkdir("dist/pages/studio", { recursive: true });
await writeFile("dist/pages/studio/index.html", '<!doctype html><html><head><meta http-equiv="refresh" content="0;url=https://some-other-life.lineddisc3.chatgpt.site/studio"><title>SOME OTHER LIFE — Studio</title></head><body><a href="https://some-other-life.lineddisc3.chatgpt.site/studio">Studio</a></body></html>');
await writeFile("dist/pages/CNAME", "someotherlife.studio\n");
await writeFile("dist/pages/.nojekyll", "");
console.log("Original experience packaged for GitHub Pages; existing signup database and private Studio preserved.");
