import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Road } from "@shared/schema";
import { useState, useEffect, useRef } from "react";

// Type for map bounds
type MapBounds = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
} | null;

// Helper function to expand bounds by a buffer percentage
function expandBounds(bounds: MapBounds, bufferPercent: number = 20): MapBounds {
  if (!bounds) return null;
  
  const { swLat, swLng, neLat, neLng } = bounds;
  
  // Calculate width and height of the current bounds
  const latDiff = neLat - swLat;
  const lngDiff = neLng - swLng;
  
  // Calculate buffer amounts
  const latBuffer = (latDiff * bufferPercent) / 100;
  const lngBuffer = (lngDiff * bufferPercent) / 100;
  
  // Return expanded bounds
  return {
    swLat: swLat - latBuffer,
    swLng: swLng - lngBuffer,
    neLat: neLat + latBuffer,
    neLng: neLng + lngBuffer
  };
}

// Helper function to check if bounds are already contained within existing bounds (with some tolerance)
function isWithinExistingBounds(newBounds: MapBounds, existingBounds: MapBounds, tolerance: number = 0.8): boolean {
  if (!newBounds || !existingBounds) return false;
  
  // Check if new bounds are fully contained within existing bounds with some tolerance
  return (
    newBounds.swLat >= existingBounds.swLat - Math.abs(existingBounds.swLat * (1 - tolerance)) &&
    newBounds.swLng >= existingBounds.swLng - Math.abs(existingBounds.swLng * (1 - tolerance)) &&
    newBounds.neLat <= existingBounds.neLat + Math.abs(existingBounds.neLat * (1 - tolerance)) &&
    newBounds.neLng <= existingBounds.neLng + Math.abs(existingBounds.neLng * (1 - tolerance))
  );
}

export function useRoadsByBounds(bounds: MapBounds) {
  const [debouncedBounds, setDebouncedBounds] = useState<MapBounds>(null);
  const [expandedBounds, setExpandedBounds] = useState<MapBounds>(null);
  const lastQueriedBoundsRef = useRef<MapBounds>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryCountRef = useRef<number>(0);
  const lastQueryTimeRef = useRef<number>(Date.now());
  
  // Debounce bounds changes to prevent too many API calls
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (!bounds) {
      setDebouncedBounds(null);
      return;
    }
    
    // If the new bounds are within our last queried expanded bounds, don't trigger a new query
    if (lastQueriedBoundsRef.current && bounds && 
        isWithinExistingBounds(bounds, lastQueriedBoundsRef.current)) {
      // console.log('Skipping query - bounds within last queried bounds');
      return;
    }
    
    // Implement rate limiting - don't allow more than 3 queries in 10 seconds
    const now = Date.now();
    const timeSinceLastQuery = now - lastQueryTimeRef.current;
    
    // If we've made too many queries recently, extend the debounce time
    let debounceTime = 500; // Default 500ms debounce
    
    if (queryCountRef.current >= 3 && timeSinceLastQuery < 10000) {
      // Calculate the time to wait until we're under the rate limit
      debounceTime = 10000 - timeSinceLastQuery + 500;
      console.log(`Rate limiting in effect, extending debounce to ${debounceTime}ms`);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Apply bounds with a buffer to reduce the need for frequent API calls
      const newExpandedBounds = expandBounds(bounds, 100); // Expanded to 100% for better caching
      setDebouncedBounds(bounds);
      setExpandedBounds(newExpandedBounds);
      lastQueriedBoundsRef.current = newExpandedBounds;
      
      // Update rate limiting metrics
      queryCountRef.current++;
      lastQueryTimeRef.current = Date.now();
      
      // Reset query count after 10 seconds
      setTimeout(() => {
        queryCountRef.current = Math.max(0, queryCountRef.current - 1);
      }, 10000);
    }, debounceTime);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [bounds]);
  
  return useQuery({
    queryKey: ['/api/roads', expandedBounds ? JSON.stringify(expandedBounds) : null],
    queryFn: async () => {
      if (!expandedBounds) return { roads: [] };
      
      const { swLat, swLng, neLat, neLng } = expandedBounds;
      const url = `/api/roads?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`;
      
      console.log(`Fetching roads for bounds: [${swLat.toFixed(4)}, ${swLng.toFixed(4)}, ${neLat.toFixed(4)}, ${neLng.toFixed(4)}]`);
      
      try {
        const response = await apiRequest('GET', url);
        const data = await response.json();
        
        if (!data.roads || !Array.isArray(data.roads)) {
          console.error('Invalid response format from API:', data);
          return { roads: [] };
        }
        
        console.log(`Received ${data.roads.length} roads from API`);
        return data;
      } catch (error) {
        console.error('Error fetching roads data:', error);
        throw error;
      }
    },
    enabled: !!expandedBounds,
    retry: 3, // Retry failed requests up to 3 times
    staleTime: 300000, // Consider data fresh for 5 minutes (increased from 1 minute)
    gcTime: 1800000, // Keep data in cache for 30 minutes (increased from 15 minutes)
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
