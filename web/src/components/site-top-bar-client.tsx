"use client";

import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { HeaderSearch } from "@/components/header-search";
import { UserMenu } from "@/components/user-menu";

type Props = {
  isAdmin: boolean;
  userPresent: boolean;
  userEmail: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export function SiteTopBarClient({
  isAdmin,
  userPresent,
  userEmail,
  displayName,
  avatarUrl,
}: Props) {
  return (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      {userPresent ? null : (
        <Link
          href="/auth/register"
          className="rounded-full bg-filler-peach-300 px-3 py-1.5 text-xs font-semibold text-filler-ink shadow-sm transition hover:bg-filler-peach-200 sm:text-sm"
        >
          Register
        </Link>
      )}
      {userPresent ? null : (
        <Link
          href="/auth/login"
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-filler-ink/90 transition hover:bg-filler-peach-200/70 sm:px-3 sm:text-sm"
        >
          Log in
        </Link>
      )}
      {userPresent && userEmail ? (
        <UserMenu
          email={userEmail}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
      ) : null}
      <div className="ml-0.5 flex items-center">
        <HeaderSearch />
      </div>
      <CartBadge />
      {isAdmin ? (
        <Link
          href="/admin"
          className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-filler-rose-800 transition hover:bg-filler-peach-200/80 lg:inline"
        >
          Admin
        </Link>
      ) : null}
    </div>
  );
}
