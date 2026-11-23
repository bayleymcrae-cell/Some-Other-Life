import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const backend = "https://some-other-life.lineddisc3.chatgpt.site";
export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  base: "/",
  publicDir: "../public",
  plugins: [react(), {
    name: "preserve-original-pages-transport",
    enforce: "pre",
    transform(code, id) {
      if (!/(collection-experience\.tsx|privacy-request\/page\.tsx|unsubscribe\/page\.tsx)$/.test(id)) return;
      return code.replaceAll('fetch("/api/', `fetch("${backend}/api/`)
        ;
    },
  }],
  css: { postcss: fileURLToPath(new URL("../", import.meta.url)) },
  build: { outDir: "../dist/pages", emptyOutDir: true, manifest: true },
});
