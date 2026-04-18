
import { ChefHat } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} FoodOrder. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
