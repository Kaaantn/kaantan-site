import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Guards every /control/** route. No session → redirect to /control/login.
// This is the visitor-facing gate; every mutating API route under
// app/api/control/** additionally calls requireUser() itself, since this
// middleware doesn't run for a route hit directly (see lib/auth/requireUser.ts).
const PUBLIC_PATHS = new Set(["/control/login", "/control/set-password"]);

export async function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const loginUrl = new URL("/control/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: "/control/:path*",
};
