
import { NextResponse } from "next/server";

// This is a simplified simulation. In a real app, you'd get this data from a database.
const deliveryRoutes: Record<string, { lat: number, lng: number }[]> = {
    "order123": [
        { lat: 34.0522, lng: -118.2437 }, // Start
        { lat: 34.0532, lng: -118.2447 },
        { lat: 34.0542, lng: -118.2457 },
        { lat: 34.0552, lng: -118.2467 },
        { lat: 34.0562, lng: -118.2477 }, // End
    ],
};

// Function to simulate the delivery
const simulateDelivery = (orderId: string) => {
    const route = deliveryRoutes[orderId];
    if (!route) {
        return;
    }

    let step = 0;
    const interval = setInterval(async () => {
        if (step < route.length) {
            const location = route[step];
            
            // Call the internal API endpoint to emit the location update
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/socket`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ orderId, location }),
                }
            );
            
            step++;
        } else {
            clearInterval(interval);
        }
    }, 2000); // Update every 2 seconds
};

export async function POST(request: Request) {
    const { orderId } = await request.json();

    if (!orderId) {
        return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    simulateDelivery(orderId);

    return NextResponse.json({ success: true, message: "Delivery simulation started" });
}
