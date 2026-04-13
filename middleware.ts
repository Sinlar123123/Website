import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/avatar",
    "/avatar/:path*",
    "/shop",
    "/shop/:path*",
    "/achievements",
    "/achievements/:path*",
    "/tasks",
    "/tasks/:path*",
    "/create-character",
    "/create-character/:path*",
    "/login",
  ],
};
