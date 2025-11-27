//middleware
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            // In middleware, request.cookies.getAll() returns array of cookies
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Auth routes protection
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        console.log("Redirecting to login - No session found");
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    if (
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register")
    ) {
      if (user) {
        console.log("Redirecting to admin - Session exists");
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
    // On auth error, continue to next middleware/handler
    // Don't break the request flow
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
