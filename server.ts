// server.ts — Custom Next.js server with Socket.IO
// Run with: npx ts-node --project tsconfig.server.json server.ts
// Or: node server.js (after compiling)

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

export let io: SocketIOServer;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Customer joins a room for their order
    socket.on("join_order", (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} joined order room: order:${orderId}`);
    });

    // Restaurant owner joins their restaurant room
    socket.on("join_restaurant", (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`[Socket] ${socket.id} joined restaurant room: ${restaurantId}`);
    });

    // Admin joins global room
    socket.on("join_admin", () => {
      socket.join("admin");
    });

    // Delivery agent joins a room for their route, linked to an order
    socket.on("join_delivery_route", (orderId: string) => {
        socket.join(`order:${orderId}`); // Join the same room as the customer
        console.log(`[Socket] Delivery agent ${socket.id} joined route for order: ${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

// Helper to emit order status updates from API routes
export function emitOrderUpdate(orderId: string, payload: {
  status: string;
  message: string;
  timestamp: string;
}) {
  if (io) {
    const fullPayload = { orderId, ...payload };
    io.to(`order:${orderId}`).emit("order_update", fullPayload);
    io.to("admin").emit("order_update", fullPayload);
  }
}

// Helper to emit delivery agent location updates from API routes
export function emitDeliveryLocationUpdate(orderId: string, payload: { lat: number; lng: number }) {
  if (io) {
    io.to(`order:${orderId}`).emit("delivery_location_update", { orderId, ...payload });
  }
}
