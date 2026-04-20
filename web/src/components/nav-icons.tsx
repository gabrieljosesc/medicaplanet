import type { SVGProps } from "react";

/** Minimal outline icons for header nav (currentColor, 24×24 viewBox). */
export function IconCartBag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5" />
      <path d="M3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v9.75a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-9.75c0-.621.504-1.125 1.125-1.125Z" />
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

export function IconUserCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
      <path d="M4.5 20.25v-.188a7.5 7.5 0 0 1 15 0v.188" />
    </svg>
  );
}
