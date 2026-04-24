import type { NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

// Next 16: proxy replaces middleware; default Node runtime avoids Edge `__dirname` issues.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
