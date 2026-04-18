"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, Clock, Star, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IRestaurant } from "@/types";
import clsx from "clsx";

const CUISINES = ["All", "Indian", "Chinese", "Italian", "Fast Food", "Desserts", "Beverages"];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) params.set("search", search);
      if (selectedCuisine !== "All") params.set("cuisine", selectedCuisine);
      if (onlyOpen) params.set("isOpen", "true");

      const res = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCuisine, onlyOpen, page]);

  useEffect(() => {
    const timer = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(timer);
  }, [fetchRestaurants]);

  return (
    <div className="container py-8 space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-focus p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Hungry? We've got you covered 🍔
          </h1>
          <p className="text-primary-content mb-6">
            Order from multiple restaurants in a single checkout
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => { setSelectedCuisine(cuisine); setPage(1); }}
              className={clsx(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedCuisine === cuisine
                  ? "bg-primary text-primary-content"
                  : "bg-secondary hover:bg-accent text-secondary-foreground"
              )}
            >
              {cuisine}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOnlyOpen(!onlyOpen)}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            onlyOpen
              ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "border-border hover:bg-accent"
          )}
        >
          <span className={clsx("h-2 w-2 rounded-full", onlyOpen ? "bg-green-500" : "bg-gray-300")} />
          Open Now
        </button>
      </div>

      {/* Restaurant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
              <div className="h-44 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-lg font-medium">No restaurants found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={clsx(
                "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-primary text-primary-content"
                  : "bg-secondary hover:bg-accent"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: IRestaurant }) {
  return (
    <Link href={`/restaurants/${restaurant._id}`}>
      <div className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <div className="relative h-44 bg-muted overflow-hidden">
          {restaurant.coverImage ? (
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              🍽️
            </div>
          )}
          <span
            className={clsx(
              "absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold",
              restaurant.isOpen
                ? "bg-green-600 text-white"
                : "bg-destructive text-destructive-foreground"
            )}
          >
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">
              {restaurant.name}
            </h3>
            {restaurant.rating > 0 && (
              <span className="flex items-center gap-0.5 text-sm font-medium text-amber-600 shrink-0 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {restaurant.rating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {restaurant.cuisineTypes?.join(" • ")}
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {restaurant.avgDeliveryTime} mins
            </span>
            {restaurant.deliveryFee === 0 ? (
              <span className="text-green-600 font-medium">Free delivery</span>
            ) : (
              <span>₹{restaurant.deliveryFee} delivery</span>
            )}
            {restaurant.minOrderAmount > 0 && (
              <span>Min ₹{restaurant.minOrderAmount}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
