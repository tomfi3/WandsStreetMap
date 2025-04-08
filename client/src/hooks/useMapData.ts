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
      
      try {
        const response = await apiRequest('GET', url);
        const data = await response.json();
        
        if (!data.roads || !Array.isArray(data.roads)) {
          console.error('Invalid response format from API:', data);
          return { roads: [] };
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching roads data:', error);
        throw error;
      }
    },
    enabled: !!bounds,
    retry: 3, // Retry failed requests up to 3 times
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep data in cache for 5 minutes
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
