
import { NextResponse } from "next/server";
import { emitDeliveryLocationUpdate } from "@/lib/socket";

export async function POST(request: Request) {
    const { orderId, location } = await request.json();

    if (!orderId || !location) {
        return NextResponse.json({ success: false, message: "Order ID and location are required" }, { status: 400 });
    }

    emitDeliveryLocationUpdate(orderId, location);

    return NextResponse.json({ success: true });
}
