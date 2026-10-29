// Finalizes the static GitHub Pages demo build (PAGES=1 VITE_STATIC=1 npm run build).
// TanStack Start writes the SPA shell as _shell.html with "/./assets/..." URLs; make them
// relative so the site works from any sub-folder, then publish it as index.html + 404.html.
import { readFileSync, writeFileSync } from "node:fs";

const dir = "dist/client";
const html = readFileSync(`${dir}/_shell.html`, "utf8").replaceAll("/./", "./");
writeFileSync(`${dir}/index.html`, html);
writeFileSync(`${dir}/404.html`, html);
// Tell GitHub Pages not to run Jekyll over the build output.
writeFileSync(`${dir}/.nojekyll`, "");
console.log("Pages build finalized in", dir);
