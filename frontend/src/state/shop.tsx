// Client-side shop state: cart, coupon and favorites. Persisted in localStorage (demo only).
// Totals here are for display; the backend must recompute everything at checkout.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { siteConfig } from "@/config/site";
import { addItem, computeTotals, setQuantity } from "@/lib/cart";
import type { Campaign, CartItem, CartTotals } from "@/types";

interface State {
  items: CartItem[];
  coupon: Campaign | null;
  favorites: string[];
}

type Action =
  | { type: "hydrate"; state: State }
  | { type: "add"; item: CartItem }
  | { type: "qty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "coupon"; coupon: Campaign | null }
  | { type: "fav"; productId: string };

const KEY = "shop-state:v1";
const empty: State = { items: [], coupon: null, favorites: [] };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return a.state;
    case "add":
      return { ...s, items: addItem(s.items, a.item) };
    case "qty":
      return { ...s, items: setQuantity(s.items, a.id, a.qty) };
    case "remove":
      return { ...s, items: s.items.filter((i) => i.id !== a.id) };
    case "clear":
      return { ...s, items: [], coupon: null };
    case "coupon":
      return { ...s, coupon: a.coupon };
    case "fav":
      return {
        ...s,
        favorites: s.favorites.includes(a.productId)
          ? s.favorites.filter((f) => f !== a.productId)
          : [...s.favorites, a.productId],
      };
  }
}

interface ShopContext extends State {
  ready: boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  totals: CartTotals;
  add: (item: CartItem) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setCoupon: (c: Campaign | null) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const Ctx = createContext<ShopContext | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, empty);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw)
        dispatch({ type: "hydrate", state: { ...empty, ...(JSON.parse(raw) as Partial<State>) } });
    } catch {
      /* storage unavailable or corrupted: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota/private mode errors */
    }
  }, [state, ready]);

  const totals = useMemo(
    () =>
      computeTotals(
        state.items,
        siteConfig.shipping.flatEstimate,
        siteConfig.shipping.freeShippingThreshold,
        state.coupon,
      ),
    [state.items, state.coupon],
  );

  const value = useMemo<ShopContext>(
    () => ({
      ...state,
      ready,
      cartOpen,
      setCartOpen,
      totals,
      add: (item) => {
        dispatch({ type: "add", item });
        setCartOpen(true);
      },
      setQty: (id, qty) => dispatch({ type: "qty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      setCoupon: (coupon) => dispatch({ type: "coupon", coupon }),
      toggleFavorite: (productId) => dispatch({ type: "fav", productId }),
      isFavorite: (productId) => state.favorites.includes(productId),
    }),
    [state, ready, totals, cartOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}

export function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
