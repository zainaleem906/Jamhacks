import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED = ["/dashboard", "/cleanup", "/leaderboard", "/profile"];
const AUTH_ONLY = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("eq_token")?.value ?? null;
  const session = token ? await verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/cleanup/:path*", "/leaderboard/:path*", "/profile/:path*", "/login", "/register"],
};
