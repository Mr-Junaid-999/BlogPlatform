// lib/supabase/server.js
"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          // Get all cookies - handle both array and RequestCookies formats
          try {
            const allCookies = cookieStore.getAll();
            // If it returns an array of {name, value} objects, return as-is
            if (
              Array.isArray(allCookies) &&
              allCookies.length > 0 &&
              "name" in allCookies[0]
            ) {
              return allCookies;
            }
            // Otherwise convert to expected format
            return Array.from(cookieStore).map(([name, value]) => ({
              name,
              value: typeof value === "string" ? value : "",
            }));
          } catch (e) {
            // Fallback to manual iteration
            return Array.from(cookieStore).map(([name, value]) => ({
              name,
              value: typeof value === "string" ? value : "",
            }));
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
