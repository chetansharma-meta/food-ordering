
"use client";
import { useEffect, useState } from "react";
import { Search, Clock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IRestaurant } from "@/types";
import clsx from "clsx";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/restaurants?limit=50");
        const data = await res.json();
        setRestaurants(data.success ? data.data : []);
      } catch (error) {
        console.error("Failed to load restaurants", error);
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const displayedRestaurants = search
    ? restaurants.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : restaurants;

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">All Restaurants</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Explore our curated selection of restaurants.</p>
        <div className="relative max-w-2xl mx-auto mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
        </div>
      ) : displayedRestaurants.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-lg font-medium">No Restaurants Found</p>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedRestaurants.map((r:any) => <RestaurantCard key={r._id} restaurant={r} />)}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: IRestaurant }) {
  return (
    <Link href={`/restaurants/${restaurant._id}`}>
      <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
        <div className="relative h-48">
          {restaurant.coverImage ? (
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-5xl bg-gray-200 dark:bg-gray-700 text-gray-400">🍽️</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-xl mb-1 text-gray-800 dark:text-white">{restaurant.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{restaurant.cuisineTypes?.join(", ")}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              {restaurant.rating?.toFixed(1) || "New"}
            </span>
            <span className="text-gray-500 dark:text-gray-400">{restaurant.avgDeliveryTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RestaurantCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-6 w-3/4 mb-2 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/2 mb-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="flex justify-between">
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
