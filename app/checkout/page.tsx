
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { IAddress } from "@/types";
import { MapPin, Plus, CheckCircle2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function CheckoutPage() {
  const { groupedItems, totalAmount, cart, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [notes, setNotes] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home", street: "", city: "", state: "", pincode: "",
  });

  const DELIVERY_FEE = 30;
  const restaurantCount = groupedItems.length;
  const grandTotal = totalAmount + DELIVERY_FEE * restaurantCount;

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!cart || cart.items.length === 0) { router.push("/cart"); return; }

    fetch("/api/users/addresses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAddresses(d.data);
          const def = d.data.find((a: IAddress) => a.isDefault) || d.data[0];
          if (def) setSelectedAddress(def);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const saveAddress = async () => {
    const res = await fetch("/api/users/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newAddress),
    });
    const data = await res.json();
    if (data.success) {
      setAddresses(data.data);
      const added = data.data[data.data.length - 1];
      setSelectedAddress(added);
      setShowAddressForm(false);
      setNewAddress({ label: "Home", street: "", city: "", state: "", pincode: "" });
      toast.success("Address saved");
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
    if (!cart || cart.items.length === 0) { toast.error("Your cart is empty"); return; }

    setIsPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          deliveryAddress: selectedAddress,
          notes,
          items: cart.items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");

      clearCart();
      toast.success(data.data.message || "Order placed successfully!");
      router.push(`/orders?success=1&group=${data.data.groupOrderId}`);

    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to place order");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Delivery Address */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-500" />
          Delivery Address
        </h2>

        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
             key={addr._id?.toString()}
              onClick={() => setSelectedAddress(addr)}
              className={clsx(
                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                selectedAddress?._id === addr._id
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                  : "border-border hover:bg-accent"
              )}
            >
              <div className={clsx(
                "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                selectedAddress?._id === addr._id ? "border-orange-500" : "border-muted-foreground"
              )}>
                {selectedAddress?._id === addr._id && (
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{addr.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
            </div>
          ))}

          {!showAddressForm ? (
            <button
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-2 w-full p-4 rounded-xl border border-dashed hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-muted-foreground hover:text-orange-500 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              Add new address
            </button>
          ) : (
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setNewAddress({ ...newAddress, label: l })}
                    className={clsx(
                      "py-1.5 rounded-lg text-sm border transition-colors",
                      newAddress.label === l
                        ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {[
                { key: "street", placeholder: "Street address" },
                { key: "city", placeholder: "City" },
                { key: "state", placeholder: "State" },
                { key: "pincode", placeholder: "Pincode" },
              ].map((f) => (
                <input
                  key={f.key}
                  placeholder={f.placeholder}
                  value={newAddress[f.key as keyof typeof newAddress]}
                  onChange={(e) => setNewAddress({ ...newAddress, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ))}
              <div className="flex gap-2">
                <button
                  onClick={saveAddress}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Save address
                </button>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 border py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order note */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Order Notes (optional)</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </section>

      {/* Order summary */}
      <section className="mb-8 rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold">Order Summary</h2>
        {groupedItems.map((g) => (
          <div key={g.restaurantId} className="text-sm">
            <p className="font-medium text-muted-foreground">{g.restaurantName || "Restaurant"}</p>
            {g.items.map((item) => (
              <div key={item.menuItemId.toString()} className="flex justify-between py-0.5 pl-3">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Items total</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery (×{restaurantCount})</span>
            <span>₹{DELIVERY_FEE * restaurantCount}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-orange-500">₹{grandTotal}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Pay with Cash on Delivery
        </div>
      </section>

      <button
        onClick={placeOrder}
        disabled={isPlacing || !selectedAddress}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPlacing ? "Placing order..." : `Place Order • ₹${grandTotal}`}
        {!isPlacing && <ChevronRight className="h-5 w-5" />}
      </button>
    </div>
  );
}
