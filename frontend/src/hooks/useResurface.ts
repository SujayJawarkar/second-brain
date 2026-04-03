import { useQuery } from "@tanstack/react-query";
import { itemsApi } from "../api/items";

export interface ResurfaceItem {
  id: string;
  title: string;
  summary: string | null;
  sourceType: string;
  tags: string[];
  decayScore: number; // 0-1, lower = more forgotten
}

export function useResurface() {
  return useQuery<ResurfaceItem[]>({
    queryKey: ["resurface"],
    queryFn: async () => {
      const res = await itemsApi.getResurface();
      return res.data.picks ?? [];
    },
    staleTime: 5 * 60_000, // recompute at most every 5 min
    retry: false,
  });
}
