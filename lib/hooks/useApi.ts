"use client";
import { useAuth } from "@/lib/context/AuthContext";
import { useCallback } from "react";

export function useApi() {
  const { token } = useAuth();

  const request = useCallback(
    async <T>(
      url: string,
      options: RequestInit = {}
    ): Promise<T> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, { ...options, headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      return data;
    },
    [token]
  );

  const get = useCallback(
    <T>(url: string) => request<T>(url),
    [request]
  );

  const post = useCallback(
    <T>(url: string, body: unknown) =>
      request<T>(url, { method: "POST", body: JSON.stringify(body) }),
    [request]
  );

  const patch = useCallback(
    <T>(url: string, body: unknown) =>
      request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
    [request]
  );

  const del = useCallback(
    <T>(url: string) => request<T>(url, { method: "DELETE" }),
    [request]
  );

  return { get, post, patch, del, request };
}
