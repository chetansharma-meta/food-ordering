import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Store io on global so it is shared between:
// - server.ts (loaded via require() by ts-node)
// - Next.js API routes (loaded via webpack bundle)
// Both share the same Node.js global object in the same process.
const SOCKET_KEY = "__socket_io_instance__";

function getIO(): SocketIOServer | undefined {
  return (global as any)[SOCKET_KEY];
}

function setIO(io: SocketIOServer) {
  (global as any)[SOCKET_KEY] = io;
}

export function setSocketServer(server: HttpServer): SocketIOServer {
  if (getIO()) {
    console.log("[Socket] Reusing existing io instance.");
    return getIO()!;
  }

  console.log("[Socket] Initializing Socket.IO server...");

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  setIO(io);

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join_order", (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} joined room: order:${orderId}`);
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

  console.log("[Socket] Socket.IO server ready.");
  return io;
}

export function emitOrderUpdate(
  orderId: string,
  payload: { status: string; message: string; timestamp: string },
  extraOrderIds: string[] = []
) {
  const io = getIO();

  if (!io) {
    console.error(
      "[Socket] ❌ io not found on global. " +
      "This means setSocketServer() has not been called yet, " +
      "OR the require() in server.ts is resolving a different file than @/lib/socket. " +
      "Check that both resolve to the same compiled output."
    );
    return;
  }

  const fullPayload = { orderId, ...payload };
  const rooms = [orderId, ...extraOrderIds];

  rooms.forEach((id) => {
    console.log(`[Socket] Emitting order_update → room: order:${id}`);
    io.to(`order:${id}`).emit("order_update", fullPayload);
  });

  io.to("admin").emit("order_update", fullPayload);
}

export function emitDeliveryLocationUpdate(
  orderId: string,
  payload: { lat: number; lng: number }
) {
  const io = getIO();
  if (!io) {
    console.warn("[Socket] Server not initialized. Skipping delivery location emit.");
    return;
  }
  io.to(`order:${orderId}`).emit("delivery_location_update", { orderId, ...payload });
}

export function getSocketServer(): SocketIOServer | null {
  return getIO() ?? null;
}