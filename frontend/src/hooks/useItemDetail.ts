import { useQuery } from "@tanstack/react-query";
import { itemsApi } from "../api/items";

export function useItemDetail(itemId: string | null) {
  const item = useQuery({
    queryKey: ["item", itemId],
    queryFn: async () => {
      const res = await itemsApi.getById(itemId!);
      return res.data.item;
    },
    enabled: !!itemId,
    staleTime: 30_000,
  });

  const related = useQuery({
    queryKey: ["related", itemId],
    queryFn: async () => {
      const res = await itemsApi.related(itemId!);
      return res.data.related as Array<{
        id: string;
        title: string;
        url: string | null;
        sourceType: string;
        similarity: number;
      }>;
    },
    enabled: !!itemId,
    staleTime: 60_000,
  });

  return { item, related };
}
