
"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useOrderTracking, useDeliveryTracking } from "@/lib/hooks/useSocket";
import { IOrder, OrderStatus } from "@/types";
import { format } from "date-fns";
import { MapPin, Clock, Package, CheckCircle2, ChefHat, Bike, Home } from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";

const STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { status: "pending", label: "Order Placed", icon: <Package className="h-5 w-5" /> },
    { status: "confirmed", label: "Confirmed", icon: <CheckCircle2 className="h-5 w-5" /> },
    { status: "preparing", label: "Preparing", icon: <ChefHat className="h-5 w-5" /> },
    { status: "out_for_delivery", label: "Out for Delivery", icon: <Bike className="h-5 w-5" /> },
    { status: "delivered", label: "Delivered", icon: <Home className="h-5 w-5" /> },
];

const STATUS_STEP: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    out_for_delivery: 3,
    delivered: 4,
    cancelled: -1,
};

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const { token } = useAuth();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const TrackingMap = useMemo(() => dynamic(() => import("@/components/maps/TrackingMap"), { ssr: false }), []);

    // Real-time updates
    const liveUpdate = useOrderTracking(orderId);
    const deliveryAgentLocation = useDeliveryTracking(orderId);

    useEffect(() => {
        fetch(`/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setOrder(d.data);
                setIsLoading(false);
            });
    }, [orderId, token]);

    // Update order state immediately when an order update event arrives
    useEffect(() => {
        if (!liveUpdate) return;

        setOrder((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                status: liveUpdate.status,
                statusHistory: [
                    ...prev.statusHistory,
                    {
                        status: liveUpdate.status,
                        timestamp: new Date(liveUpdate.timestamp),
                    },
                ],
            };
        });
    }, [liveUpdate]);

    if (isLoading) {
        return (
            <div className="container py-8 max-w-2xl space-y-4">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="h-32 rounded-xl bg-muted animate-pulse" />
                <div className="h-48 rounded-xl bg-muted animate-pulse" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container py-20 text-center text-muted-foreground">
                <p className="text-4xl mb-3">📦</p>
                <p>Order not found</p>
            </div>
        );
    }

    const currentStep = STATUS_STEP[order.status];
    const isCancelled = order.status === "cancelled";

    const initialCenter: [number, number] = [34.0522, -118.2437];

    return (
        <div className="container py-8 max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">{order.orderId}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {order.restaurantName} · {format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}
                </p>
            </div>

            {/* Completed banner */}
            {order.status === "delivered" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-4 text-sm text-emerald-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Order completed successfully.</span>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold mb-6">Delivery Map</h2>
                <TrackingMap center={initialCenter} deliveryAgentLocation={deliveryAgentLocation} />
            </div>

            {/* Live update indicator */}
            {liveUpdate && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-sm animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                    {liveUpdate.message}
                </div>
            )}

            {/* Tracking stepper */}
            {!isCancelled ? (
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="font-semibold mb-6">Order Status</h2>
                    <div className="relative">
                        {/* Connector line */}
                        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-muted" />
                        <div
                            className="absolute left-5 top-5 w-0.5 bg-orange-500 transition-all duration-500"
                            style={{
                                height: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%`,
                            }}
                        />

                        <div className="space-y-6">
                            {STEPS.map((step, idx) => {
                                const done = idx <= currentStep;
                                const active = idx === currentStep;
                                return (
                                    <div key={step.status} className="flex items-center gap-4 relative">
                                        <div
                                            className={clsx(
                                                "h-10 w-10 rounded-full flex items-center justify-center z-10 transition-colors",
                                                done
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {step.icon}
                                        </div>
                                        <div>
                                            <p className={clsx("font-medium text-sm", done ? "" : "text-muted-foreground")}>
                                                {step.label}
                                            </p>
                                            {active && (
                                                <p className="text-xs text-orange-500">In progress</p>
                                            )}
                                            {done && !active && idx < currentStep && (
                                                <p className="text-xs text-muted-foreground">Done</p>
                                            )}
                                        </div>
                                        {active && (
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium animate-pulse">
                                                Live
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border bg-red-50 dark:bg-red-900/20 p-5 text-center">
                    <p className="text-3xl mb-2">❌</p>
                    <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
                </div>
            )}

            {/* Order items */}
            <div className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-4">Items Ordered</h2>
                <div className="space-y-2">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <span>
                                {item.name}
                                <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                            </span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t mt-3 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Delivery fee</span>
                        <span>₹{order.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-orange-500">₹{order.totalAmount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-1">
                        💵 Cash on Delivery · {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                    </div>
                </div>
            </div>

            {/* Delivery address */}
            <div className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    Delivery Address
                </h2>
                <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{order.deliveryAddress.label}</p>
                    <p>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                    <p>
                        {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </p>
                </div>
            </div>

            {/* Estimated delivery */}
            {order.estimatedDeliveryTime && order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="rounded-xl border bg-card p-4 flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                    <div>
                        <span className="font-medium">Estimated delivery: </span>
                        <span className="text-muted-foreground">
                            {format(new Date(order.estimatedDeliveryTime), "h:mm a")}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
