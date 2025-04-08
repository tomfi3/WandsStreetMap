import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Road } from "@shared/schema";
import { useEffect } from "react";

// Define the Wandsworth bounds
const WANDSWORTH_BOUNDS = {
  swLat: 51.4137, // Southwest latitude
  swLng: -0.3020, // Southwest longitude
  neLat: 51.5005, // Northeast latitude
  neLng: -0.0834, // Northeast longitude
};

export function useRoadsByBounds(bounds: {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
} | null) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['/api/roads', bounds ? JSON.stringify(bounds) : null],
    queryFn: async () => {
      if (!bounds) return { roads: [] };
      
      const { swLat, swLng, neLat, neLng } = bounds;
      
      // Before making a network request, check if we already have data for the full Wandsworth area
      const fullCacheKey = ['/api/roads', JSON.stringify(WANDSWORTH_BOUNDS)];
      const cachedFullData = queryClient.getQueryData(fullCacheKey) as { roads: Road[] } | undefined;
      
      if (cachedFullData?.roads?.length) {
        console.log('Using cached Wandsworth data to filter local view...');
        
        // Filter the cached data to only show roads in the current viewport
        const filteredRoads = cachedFullData.roads.filter(road => {
          return road.coordinates.some(coord => {
            const [lat, lng] = coord;
            return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
          });
        });
        
        return { roads: filteredRoads };
      }
      
      // If no cached data is available, fetch from the API
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
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 3600000, // Keep data in cache for 1 hour
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

/**
 * Hook to preload all roads in the Wandsworth area in the background
 * This function will automatically fetch all roads for the entire Wandsworth borough
 * and store them in the cache for faster access when navigating the map
 */
export function usePreloadWandsworthRoads() {
  const client = useQueryClient();
  
  useEffect(() => {
    const prefetchRoads = async () => {
      console.log('Background loading all roads in Wandsworth area...');
      
      try {
        // Prefetch the data for the entire Wandsworth area
        const url = `/api/roads?swLat=${WANDSWORTH_BOUNDS.swLat}&swLng=${WANDSWORTH_BOUNDS.swLng}&neLat=${WANDSWORTH_BOUNDS.neLat}&neLng=${WANDSWORTH_BOUNDS.neLng}`;
        
        // Set a longer timeout for this large request
        const response = await apiRequest('GET', url, undefined, { timeout: 60000 });
        const data = await response.json();
        
        if (data.roads && Array.isArray(data.roads)) {
          // Store the complete data in the cache
          client.setQueryData(
            ['/api/roads', JSON.stringify(WANDSWORTH_BOUNDS)], 
            data
          );
          
          console.log(`Successfully preloaded ${data.roads.length} roads for Wandsworth area`);
        }
      } catch (error) {
        console.error('Error preloading Wandsworth roads:', error);
        // Do not re-throw error as this is a background operation
      }
    };

    // Start loading after a short delay to avoid competing with initial view
    const timer = setTimeout(() => {
      prefetchRoads();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [client]);
}
