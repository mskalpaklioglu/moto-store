import { QueryClient } from "@tanstack/react-query";
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Static GitHub Pages demo (VITE_STATIC=1) uses hash URLs so it works from any sub-folder.
const useHash = import.meta.env.VITE_STATIC === "1" && typeof window !== "undefined";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    ...(useHash ? { history: createHashHistory() } : {}),
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
