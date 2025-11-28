import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RegisterPage({ searchParams }) {
  const errorParams = await searchParams;
  const error = errorParams?.error;
  const successParams = await searchParams;
  const success = successParams?.success;

  async function registerAction(formData) {
    "use server";

    const supabase = await createClient();
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username");
    const display_name = formData.get("display_name");

    // Basic validation
    if (!email || !password || !username || !display_name) {
      redirect("/register?error=All fields are required");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toString())) {
      redirect("/register?error=Please enter a valid email address");
    }

    // Username validation
    if (username.toString().length < 3) {
      redirect("/register?error=Username must be at least 3 characters");
    }

    // Password validation
    if (password.toString().length < 6) {
      redirect("/register?error=Password must be at least 6 characters");
    }

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toString())
        .single();

      if (existingUser) {
        redirect("/register?error=Username already exists");
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toString(),
        password: password.toString(),
        options: {
          data: {
            username: username.toString(),
            display_name: display_name.toString(),
          },
        },
      });

      if (authError) {
        redirect(`/register?error=${encodeURIComponent(authError.message)}`);
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            username: username.toString(),
            display_name: display_name.toString(),
            email: email.toString(),
          },
        ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          redirect("/register?error=Account created but profile setup failed");
        }

        redirect(
          "/register?success=Account created successfully! Please check your email for verification."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      redirect("/register?error=An unexpected error occurred");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <Input
                type="text"
                name="display_name"
                placeholder="Display Name"
                className="w-full"
                required
                minLength={1}
              />
            </div>

            <div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full"
                required
                minLength={3}
              />
            </div>

            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
