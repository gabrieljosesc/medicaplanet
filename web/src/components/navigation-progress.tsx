"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationProgressContextValue = {
  start: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(null);

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

/**
 * Top-of-page progress bar for internal navigations (links and programmatic
 * `router.push` when started via `useProgressRouter`).
 */
export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => setActive(false), 120);
  }, []);

  useEffect(() => {
    stop();
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [pathname, searchParams, stop]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const nextPath = url.pathname + url.search + url.hash;
      const currentPath =
        window.location.pathname + window.location.search + window.location.hash;
      if (nextPath === currentPath) return;

      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start, pathname]);

  return (
    <NavigationProgressContext.Provider value={{ start }}>
      <ProgressBar active={active} />
      {children}
    </NavigationProgressContext.Provider>
  );
}

function ProgressBar({ active }: { active: boolean }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-teal-100/40"
      aria-hidden={!active}
    >
      <div
        className={`h-full bg-teal-700 transition-opacity duration-200 ${
          active ? "w-full animate-pulse opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
