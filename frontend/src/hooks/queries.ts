// React Query wrappers around the service registry. Components never import mock data directly.
import { useQuery } from "@tanstack/react-query";
import { catalog } from "@/services";
import type { ProductQuery } from "@/types";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => catalog.listCategories(),
    staleTime: 60_000,
  });

export const useBrands = () =>
  useQuery({ queryKey: ["brands"], queryFn: () => catalog.listBrands(), staleTime: 60_000 });

export const useProducts = (q: ProductQuery) =>
  useQuery({
    queryKey: ["products", q],
    queryFn: () => catalog.listProducts(q),
    placeholderData: (prev) => prev,
  });

export const useProduct = (slug: string) =>
  useQuery({ queryKey: ["product", slug], queryFn: () => catalog.getProduct(slug) });

export const useRelated = (productId: string | undefined) =>
  useQuery({
    queryKey: ["related", productId],
    queryFn: () => catalog.getRelated(productId!, 4),
    enabled: !!productId,
  });

export const useProductsByIds = (ids: string[]) =>
  useQuery({ queryKey: ["products-by-ids", ids], queryFn: () => catalog.getProductsByIds(ids) });

export const useReviews = (productId: string | undefined) =>
  useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => catalog.listReviews(productId!),
    enabled: !!productId,
  });

export const useArticles = () =>
  useQuery({ queryKey: ["articles"], queryFn: () => catalog.listArticles() });
