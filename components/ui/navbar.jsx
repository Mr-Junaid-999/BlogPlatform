import Link from "next/link";
import { Button } from "./button";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

// Server Component
export async function Navbar() {
  const supabase = await createClient();

  // Use getSession instead of getUser for better reliability
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user || null;

  console.log("Server Navbar - User:", user?.email);

  // Server Action for sign out
  async function handleSignOut() {
    "use server";

    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      redirect("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
      redirect("/");
    }
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              BlogPlatform
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/blog"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                Blog
              </Link>
              {user && (
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  Hello, {user.email}
                </span>
                <form action={handleSignOut}>
                  <Button variant="outline" type="submit">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
