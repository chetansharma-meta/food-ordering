
"use client";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="container py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container py-12">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl">
          <div className="p-8">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <div>
                    <div className="text-xl font-medium text-black dark:text-white">{user.name}</div>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400" />
                    <p className="ml-3 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Name:</span> {user.name}
                    </p>
                </div>
                <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <p className="ml-3 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Email:</span> {user.email}
                    </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
