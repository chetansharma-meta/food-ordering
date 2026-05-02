import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setSocketServer(server: HttpServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join_order", (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} joined order room: order:${orderId}`);
    });

    socket.on("join_restaurant", (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`[Socket] ${socket.id} joined restaurant room: ${restaurantId}`);
    });

    socket.on("join_admin", () => {
      socket.join("admin");
      console.log(`[Socket] ${socket.id} joined admin room`);
    });

    socket.on("join_delivery_route", (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] Delivery agent ${socket.id} joined route for order: ${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitOrderUpdate(orderId: string, payload: {
  status: string;
  message: string;
  timestamp: string;
}) {
  if (!io) {
    console.warn("Socket server not initialized yet. Skipping order update emit.");
    return;
  }

  const fullPayload = { orderId, ...payload };
  io.to(`order:${orderId}`).emit("order_update", fullPayload);
  io.to("admin").emit("order_update", fullPayload);
}

export function emitDeliveryLocationUpdate(orderId: string, payload: { lat: number; lng: number }) {
  if (!io) {
    console.warn("Socket server not initialized yet. Skipping delivery location emit.");
    return;
  }

  io.to(`order:${orderId}`).emit("delivery_location_update", { orderId, ...payload });
}

export function getSocketServer() {
  return io;
}
