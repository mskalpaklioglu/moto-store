import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// PAGES=1 builds a static single-page demo (GitHub Pages): relative asset paths and
// hash-based URLs (set VITE_STATIC=1 too), so it works from any sub-folder.
// The default build is the full SSR app.
const staticDemo = process.env.PAGES === "1";

export default defineConfig({
  base: staticDemo ? "./" : "/",
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (SSR error wrapper).
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      ...(staticDemo ? { spa: { enabled: true } } : {}),
    }),
    ...(staticDemo ? [] : [nitro()]),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
});
