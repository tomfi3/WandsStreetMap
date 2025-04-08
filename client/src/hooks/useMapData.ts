import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Road } from "@shared/schema";

export function useRoadsByBounds(bounds: {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
} | null) {
  return useQuery({
    queryKey: ['/api/roads', bounds ? JSON.stringify(bounds) : null],
    queryFn: async () => {
      if (!bounds) return { roads: [] };
      
      const { swLat, swLng, neLat, neLng } = bounds;
      const url = `/api/roads?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
    enabled: !!bounds,
  });
}

export function useHighlightRoad() {
  return useMutation({
    mutationFn: async (road: Omit<Road, "id">) => {
      const response = await apiRequest('POST', '/api/highlights', road);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/highlights'] });
    },
  });
}

export function useRoadHighlights() {
  return useQuery({
    queryKey: ['/api/highlights'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/highlights');
      return response.json();
    },
  });
}

export function useDeleteRoadHighlight() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/highlights/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/highlights'] });
    },
  });
}
