import { useQuery } from "@tanstack/react-query";
import { itemsApi } from "../api/items";
import type { Item } from "../types";

export function useItems() {
  return useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await itemsApi.list();
      return res.data.items;
    },
    refetchInterval: 10000, // fallback poll every 10s
  });
}
