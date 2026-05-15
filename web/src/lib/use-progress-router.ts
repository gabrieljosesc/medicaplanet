"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useNavigationProgress } from "@/components/navigation-progress";

/** `router.push` / `replace` that also starts the top navigation progress bar. */
export function useProgressRouter() {
  const router = useRouter();
  const progress = useNavigationProgress();

  const push = useCallback(
    (href: string, options?: Parameters<typeof router.push>[1]) => {
      progress?.start();
      router.push(href, options);
    },
    [router, progress]
  );

  const replace = useCallback(
    (href: string, options?: Parameters<typeof router.replace>[1]) => {
      progress?.start();
      router.replace(href, options);
    },
    [router, progress]
  );

  return { push, replace, refresh: router.refresh, back: router.back, forward: router.forward };
}
