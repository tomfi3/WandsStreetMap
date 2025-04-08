import { roadHighlights, type RoadHighlight, type InsertRoadHighlight, type Road } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  saveRoadHighlight(highlight: InsertRoadHighlight): Promise<RoadHighlight>;
  getRoadHighlights(): Promise<RoadHighlight[]>;
  getRoadHighlight(id: number): Promise<RoadHighlight | undefined>;
  deleteRoadHighlight(id: number): Promise<boolean>;
  getRoadsByBounds(swLat: number, swLng: number, neLat: number, neLng: number): Promise<Road[]>;
}

// Calculate the distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate the length of a road based on its coordinates
function calculateRoadLength(coordinates: [number, number][]): number {
  let length = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];
    length += calculateDistance(lat1, lon1, lat2, lon2);
  }
  return length;
}

// In-memory storage implementation with Overpass API integration
export class MemStorage implements IStorage {
  private highlights: Map<number, RoadHighlight>;
  private currentId: number;
  private roadCache: Map<string, Road[]>; // Cache roads by bounding box to avoid redundant API calls

  constructor() {
    this.highlights = new Map();
    this.currentId = 1;
    this.roadCache = new Map();
  }

  async saveRoadHighlight(highlight: InsertRoadHighlight): Promise<RoadHighlight> {
    const id = this.currentId++;
    const createdAt = new Date().toISOString();
    
    const roadHighlight: RoadHighlight = {
      ...highlight,
      id,
      createdAt
    };
    
    this.highlights.set(id, roadHighlight);
    return roadHighlight;
  }

  async getRoadHighlights(): Promise<RoadHighlight[]> {
    return Array.from(this.highlights.values());
  }

  async getRoadHighlight(id: number): Promise<RoadHighlight | undefined> {
    return this.highlights.get(id);
  }

  async deleteRoadHighlight(id: number): Promise<boolean> {
    return this.highlights.delete(id);
  }

  async getRoadsByBounds(swLat: number, swLng: number, neLat: number, neLng: number): Promise<Road[]> {
    // Create a cache key for this bounding box (rounded to 4 decimal places for better cache hits)
    const cacheKey = `${swLat.toFixed(4)},${swLng.toFixed(4)},${neLat.toFixed(4)},${neLng.toFixed(4)}`;
    
    if (this.roadCache.has(cacheKey)) {
      return this.roadCache.get(cacheKey) || [];
    }
    
    try {
      // Create Overpass API query for roads in Wandsworth within the given bounds
      // Formatting: south, west, north, east
      const overpassQuery = `
        [out:json];
        (
          // First, fetch roads within the bounding box
          way[highway][name](${swLat},${swLng},${neLat},${neLng});
          
          // Alternative approach: Get roads in Wandsworth area
          // This is a simplified version; in real Overpass QL we'd use area filter
          way[highway][name](around:1500,51.4571,-0.1927);
        );
        out body;
        >;
        out skel qt;
      `;
      
      // Fetch road data from Overpass API
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Prepare a map of node ID to [lat, lon]
      const nodes = new Map<number, [number, number]>();
      data.elements.forEach((element: any) => {
        if (element.type === 'node') {
          nodes.set(element.id, [element.lat, element.lon]);
        }
      });
      
      // Process ways (roads)
      const roads: Road[] = [];
      data.elements.forEach((element: any) => {
        if (element.type === 'way' && element.tags && element.tags.highway) {
          const coordinates: [number, number][] = [];
          
          // Get coordinates for each node in the way
          element.nodes.forEach((nodeId: number) => {
            const nodeCoords = nodes.get(nodeId);
            if (nodeCoords) {
              coordinates.push(nodeCoords);
            }
          });
          
          if (coordinates.length > 0) {
            const roadType = getRoadType(element.tags.highway);
            const name = element.tags.name || 'Unnamed Road';
            
            // Calculate road length using the Haversine formula
            const length = calculateRoadLength(coordinates);
            
            roads.push({
              id: `road-${element.id}`,
              osmId: `way/${element.id}`,
              name,
              roadType,
              length,
              coordinates,
            });
          }
        }
      });
      
      // Cache the result
      this.roadCache.set(cacheKey, roads);
      
      return roads;
    } catch (error) {
      console.error('Error fetching roads from Overpass API:', error);
      return [];
    }
  }
}

// Helper function to map OSM highway types to more user-friendly categories
function getRoadType(highwayType: string): string {
  switch (highwayType) {
    case 'motorway':
    case 'trunk':
      return 'Motorway';
    case 'primary':
      return 'Primary';
    case 'secondary':
      return 'Secondary';
    case 'tertiary':
      return 'Tertiary';
    case 'residential':
      return 'Residential';
    case 'service':
      return 'Service';
    case 'footway':
    case 'path':
    case 'cycleway':
      return 'Path';
    default:
      return 'Other';
  }
}

export const storage = new MemStorage();
