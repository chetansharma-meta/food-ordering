"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { OrderStatus } from "@/types";

interface OrderUpdateEvent {
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
}

interface LocationUpdateEvent {
    orderId: string;
    lat: number;
    lng: number;
}

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    socketInstance = io(socketUrl, {
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useSocket() {
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();
    return () => {
      // Don't disconnect globally — just leave
    };
  }, []);

  return socketRef.current;
}

// Track a specific order's real-time status
export function useOrderTracking(orderId: string | null) {
  const socket = useSocket();
  const [update, setUpdate] = useState<OrderUpdateEvent | null>(null);

  useEffect(() => {
    if (!orderId) return;

    socket.emit("join_order", orderId);

    const handler = (data: OrderUpdateEvent) => {
      if (data.orderId === orderId) setUpdate(data);
    };

    socket.on("order_update", handler);

    return () => {
      socket.off("order_update", handler);
    };
  }, [socket, orderId]);

  return update;
}

// Track a delivery agent's real-time location
export function useDeliveryTracking(orderId: string | null) {
  const socket = useSocket();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!orderId) return;

    socket.emit("join_delivery_route", orderId);

    const handler = (data: LocationUpdateEvent) => {
        if (data.orderId === orderId) {
            setLocation({ lat: data.lat, lng: data.lng });
        }
    };

    socket.on("delivery_location_update", handler);

    return () => {
        socket.off("delivery_location_update", handler);
    };
  }, [socket, orderId]);

  return location;
}

// Hook for admin to receive all order updates
export function useAdminSocket(onOrderUpdate: (order: any) => void) {
    const socket = useSocket();
  
    useEffect(() => {
      socket.emit("join_admin");
  
      socket.on("order_update", onOrderUpdate);
  
      return () => {
        socket.off("order_update", onOrderUpdate);
      };
    }, [socket, onOrderUpdate]);
}
