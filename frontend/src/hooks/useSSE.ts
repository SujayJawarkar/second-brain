import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export function useSSE() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    const es = new EventSource(`${apiUrl}/stream?token=${token}`);

    es.addEventListener("connected", (e) => {
      console.log("✅ SSE connected", e.data);
    });

    es.addEventListener("item:processing", (e) => {
      console.log("📡 SSE item:processing", e.data);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    });

    es.addEventListener("item:ready", (e) => {
      console.log("📡 SSE item:ready", e.data);
      const data = JSON.parse(e.data);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success(`Ready: ${data.title}`, { icon: "✅" });
    });

    es.onerror = (e) => {
      console.error("SSE error", e);
    };

    return () => {
      console.log("SSE closing");
      es.close();
    };
  }, [token, queryClient]);
}
