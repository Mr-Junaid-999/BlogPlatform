import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function AdminLayout({ children }) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session check error:", error);
      redirect("/login");
    }

    if (!session) {
      redirect("/login");
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
