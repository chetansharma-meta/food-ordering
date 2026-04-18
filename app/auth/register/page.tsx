"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHat, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    role: "customer" as "customer" | "restaurant_owner",
  });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
      router.push("/");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join FoodOrder today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            {(["customer", "restaurant_owner"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={clsx(
                  "py-2 rounded-lg text-sm font-medium border transition-colors",
                  form.role === r
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                    : "border-border hover:bg-accent"
                )}
              >
                {r === "customer" ? "🧑 Customer" : "🍳 Restaurant Owner"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone (optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
