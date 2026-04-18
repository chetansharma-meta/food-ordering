"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut, ChefHat, LayoutDashboard, Package } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { useState } from "react";
import clsx from "clsx";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <ChefHat className="h-6 w-6 text-orange-500" />
          <span>FoodOrder</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={clsx(
              "text-sm font-medium transition-colors hover:text-orange-500",
              pathname === "/" ? "text-orange-500" : "text-muted-foreground"
            )}
          >
            Restaurants
          </Link>
          {isAuthenticated && (
            <Link
              href="/orders"
              className={clsx(
                "text-sm font-medium transition-colors hover:text-orange-500",
                pathname.startsWith("/orders")
                  ? "text-orange-500"
                  : "text-muted-foreground"
              )}
            >
              My Orders
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-accent transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-medium hover:bg-accent/80 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block max-w-[100px] truncate">
                  {user?.name}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-lg border bg-card shadow-lg p-1">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user?.email}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 capitalize">
                        {user?.role?.replace("_", " ")}
                      </span>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>

                    {(user?.role === "restaurant_owner" || user?.role === "admin") && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}

                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium hover:text-orange-500 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-orange-500 text-white px-4 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
