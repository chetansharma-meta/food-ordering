
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star, Clock, ShoppingCart } from "lucide-react";
import { IRestaurant, IMenuItem } from "@/types";
import { useCart } from "@/lib/context/CartContext";

export default function RestaurantPage() {
  const params = useParams();
  const { id } = params;
  const { addItem } = useCart();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menu, setMenu] = useState<IMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof id === "string") {
      setIsLoading(true);

      const loadRestaurant = async () => {
        try {
          const [restaurantRes, menuRes] = await Promise.all([
            fetch(`/api/restaurants/${id}`),
            fetch(`/api/menu-items?restaurantId=${id}`),
          ]);

          const restaurantData = await restaurantRes.json();
          const menuData = await menuRes.json();

          setRestaurant(restaurantData.success ? restaurantData.data : null);
          setMenu(menuData.success ? menuData.data : []);
        } catch (error) {
          console.error("Failed to load restaurant data", error);
          setRestaurant(null);
          setMenu([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadRestaurant();
    }
  }, [id]);

  // Use the addItem function from context directly. It already handles toasts.
  const handleAddToCart = (menuItemId: string) => {
    addItem(menuItemId);
  };

  if (isLoading) return <RestaurantPageSkeleton />;
  if (!restaurant) return <div className="container py-12 text-center">Restaurant not found.</div>;

  return (
    <div className="container py-12">
      {/* Restaurant Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
            {restaurant.coverImage ? (
              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-6xl bg-gray-200 dark:bg-gray-700 text-gray-400">🍽️</div>
            )}
          </div>
        </div>
        <div className="md:w-2/3">
          <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">{restaurant.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{restaurant.cuisineTypes?.join(", ")}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 text-yellow-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-semibold text-base">{restaurant.rating?.toFixed(1) || "New"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-5 w-5" />
              <span className="text-base">{restaurant.avgDeliveryTime} min</span>
            </span>
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl">{restaurant.description}</p>
        </div>
      </div>

      {/* Menu */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map(item => <MenuItemCard key={item._id.toString()} item={item} onAddToCart={() => handleAddToCart(item._id.toString())} />)}
        </div>
      </div>
    </div>
  );
}

function MenuItemCard({ item, onAddToCart }: { item: IMenuItem, onAddToCart: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
      {item.image && (
        <div className="relative h-40">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow mb-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-blue-600">₹{item.price.toFixed(2)}</span>
          <button onClick={onAddToCart} className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function RestaurantPageSkeleton() {
  return (
    <div className="container py-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <div className="h-64 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <div className="md:w-2/3">
          <div className="h-10 w-3/4 mb-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-1/2 mb-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="flex gap-6">
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="mt-6 h-16 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="text-center mb-6">
        <div className="h-8 w-48 mx-auto bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="h-40 bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-4">
              <div className="h-6 w-3/4 mb-2 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-full mb-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
