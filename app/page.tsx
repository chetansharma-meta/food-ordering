
"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Clock, Star, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IRestaurant } from "@/types";
import clsx from "clsx";
import { restaurants as staticRestaurants } from "@/lib/placeholder-data";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    let filteredRestaurants = staticRestaurants;

    if (search) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setRestaurants(filteredRestaurants as any[]);
    setIsLoading(false);
  }, [search]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="container py-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-full p-2 max-w-sm mx-auto mb-4 flex items-center gap-2 text-sm shadow-sm">
          <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 font-semibold flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> New
          </div>
          <p className="text-gray-600 dark:text-gray-300">Welcome to the future of food ordering!</p>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Delicious food, delivered to you
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover local restaurants, browse menus, and enjoy your favorite meals with just a few clicks.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/restaurants" className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Order Now
          </Link>
          <Link href="#restaurants" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
            Explore restaurants <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main id="restaurants" className="container py-12">
        {/* Search and Filters */}
        <div className="mb-10">
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Restaurant Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <p className="text-6xl mb-4">🍽️</p>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">No Restaurants Found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: IRestaurant }) {
  return (
    <Link href={`/restaurants/${restaurant._id}`} className="block group">
      <div className="rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 h-full flex flex-col">
        <div className="relative h-48">
          {restaurant.coverImage ? (
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-6xl bg-gray-200 dark:bg-gray-700 text-gray-400">🍽️</div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            {restaurant.rating?.toFixed(1) || "New"}
          </div>
        </div>
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{restaurant.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {restaurant.location.city}
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
            {restaurant.cuisineTypes?.join(", ")}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 mt-auto">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {restaurant.avgDeliveryTime} min
            </span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {restaurant.deliveryFee === 0 ? "Free Delivery" : `$${restaurant.deliveryFee}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RestaurantCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-gray-700" />
      <div className="p-5">
        <div className="h-6 w-3/4 mb-2 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/2 mb-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-full mb-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
