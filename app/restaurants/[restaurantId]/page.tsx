"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star, Clock, MapPin, ChevronRight, Plus, Minus } from "lucide-react";
import { IRestaurant, IMenuItem } from "@/types";
import { useCart } from "@/lib/context/CartContext";
import clsx from "clsx";

interface MenuCategory {
  _id: string;
  name: string;
  items: IMenuItem[];
}

export default function RestaurantPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    async function load() {
      const [restRes, menuRes] = await Promise.all([
        fetch(`/api/restaurants/${restaurantId}`),
        fetch(`/api/restaurants/${restaurantId}/menu`),
      ]);
      const restData = await restRes.json();
      const menuData = await menuRes.json();
      if (restData.success) setRestaurant(restData.data);
      if (menuData.success) {
        setMenu(menuData.data);
        if (menuData.data.length > 0) setActiveCategory(menuData.data[0]._id);
      }
      setIsLoading(false);
    }
    load();
  }, [restaurantId]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="h-56 rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 rounded bg-muted animate-pulse" />
            ))}
          </div>
          <div className="col-span-2 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <p className="text-4xl mb-4">🍽️</p>
        <p className="text-lg">Restaurant not found</p>
      </div>
    );
  }

  const filteredMenu = vegOnly
    ? menu.map((cat) => ({ ...cat, items: cat.items.filter((i) => i.foodType === "veg") }))
    : menu;

  return (
    <div className="pb-20">
      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-muted">
        {restaurant.coverImage ? (
          <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-white/80 text-sm">{restaurant.cuisineTypes?.join(" • ")}</p>
        </div>
      </div>

      <div className="container py-6">
        {/* Info row */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b text-sm text-muted-foreground">
          {restaurant.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} ratings)
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {restaurant.avgDeliveryTime} min delivery
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {restaurant.location.city}
          </span>
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-xs font-semibold",
              restaurant.isOpen
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            )}
          >
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </span>

          {/* Veg toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs">Veg only</span>
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={clsx(
                "relative w-10 h-5 rounded-full transition-colors",
                vegOnly ? "bg-green-500" : "bg-gray-300"
              )}
            >
              <span
                className={clsx(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  vegOnly ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>
        </div>

        {/* Two-column layout: category nav + items */}
        <div className="flex gap-6">
          {/* Sticky category sidebar */}
          <aside className="hidden md:block w-44 shrink-0">
            <div className="sticky top-20 space-y-1">
              {menu.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => scrollToCategory(cat._id)}
                  className={clsx(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeCategory === cat._id
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                      : "hover:bg-accent text-muted-foreground"
                  )}
                >
                  {cat.name}
                  <span className="ml-1 text-xs text-muted-foreground">({cat.items.length})</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Menu items */}
          <div className="flex-1 space-y-8">
            {filteredMenu.map((cat) => (
              <div
                key={cat._id}
                ref={(el) => { categoryRefs.current[cat._id] = el; }}
              >
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">{cat.name}</h2>
                <div className="space-y-3">
                  {cat.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No items in this category</p>
                  ) : (
                    cat.items.map((item) => (
                      <MenuItemCard key={item._id} item={item} />
                    ))
                  )}
                </div>
              </div>
            ))}

            {filteredMenu.every((c) => c.items.length === 0) && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-4xl mb-3">🥗</p>
                <p>No veg items available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItemCard({ item }: { item: IMenuItem }) {
  const { cart, addItem, updateItem } = useCart();

  const cartItem = cart?.items?.find(
    (i) => i.menuItemId.toString() === item._id.toString()
  );
  const qty = cartItem?.quantity ?? 0;

  const effectivePrice = item.discountedPrice ?? item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      {/* Food type indicator */}
      <span
        title={item.foodType}
        className={clsx(
          "mt-1 shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center",
          item.foodType === "veg"
            ? "border-green-600"
            : item.foodType === "egg"
            ? "border-yellow-500"
            : "border-red-600"
        )}
      >
        <span
          className={clsx(
            "h-2 w-2 rounded-full",
            item.foodType === "veg"
              ? "bg-green-600"
              : item.foodType === "egg"
              ? "bg-yellow-500"
              : "bg-red-600"
          )}
        />
      </span>

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-medium text-sm">{item.name}</h3>
          {item.isPopular && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">
              Popular
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">₹{effectivePrice}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">₹{item.price}</span>
          )}
        </div>
      </div>

      {/* Image + add button */}
      <div className="relative shrink-0">
        <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center text-2xl">🍛</div>
          )}
        </div>

        {/* Add / quantity control */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          {qty === 0 ? (
            <button
              onClick={() => addItem(item._id)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow transition-colors whitespace-nowrap"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-orange-500 text-white rounded-full shadow px-1 py-0.5 gap-1">
              <button
                onClick={() => updateItem(item._id, qty - 1)}
                className="h-5 w-5 flex items-center justify-center hover:bg-orange-600 rounded-full transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-bold w-4 text-center">{qty}</span>
              <button
                onClick={() => updateItem(item._id, qty + 1)}
                className="h-5 w-5 flex items-center justify-center hover:bg-orange-600 rounded-full transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
