"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function RouteLayoutWrapper({
  defaultChrome,
  children,
}: {
  defaultChrome: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {defaultChrome}
      <div
        className={
          isHome
            ? "w-full flex-1"
            : "mx-auto min-h-[55vh] w-full max-w-6xl flex-1 px-4 py-8"
        }
      >
        {children}
      </div>
    </>
  );
}
