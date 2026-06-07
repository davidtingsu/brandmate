import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ONBOARDED_COOKIE = "brandmate_onboarded";

const STATIC_PREFIXES = [
  "/_next",
  "/api",
  "/brandmate-logo.png",
  "/examples",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const onboarded = request.cookies.get(ONBOARDED_COOKIE)?.value === "1";
  const isOnboard = pathname === "/onboard";
  const isEdit = searchParams.get("edit") === "1";

  if (!onboarded && !isOnboard) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboard";
    if (pathname !== "/") {
      url.searchParams.set("return", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(url);
  }

  if (onboarded && isOnboard && !isEdit) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
