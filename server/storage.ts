import { roadHighlights, type RoadHighlight, type InsertRoadHighlight, type Road } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  saveRoadHighlight(highlight: InsertRoadHighlight): Promise<RoadHighlight>;
  getRoadHighlights(): Promise<RoadHighlight[]>;
  getRoadHighlight(id: number): Promise<RoadHighlight | undefined>;
  deleteRoadHighlight(id: number): Promise<boolean>;
  getRoadsByBounds(swLat: number, swLng: number, neLat: number, neLng: number): Promise<Road[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private highlights: Map<number, RoadHighlight>;
  private currentId: number;
  private mockRoads: Road[];

  constructor() {
    this.highlights = new Map();
    this.currentId = 1;
    
    // Initialize with some mock road data for Wandsworth
    this.mockRoads = [
      {
        id: "road1",
        osmId: "way/12345678",
        name: "Wandsworth High Street",
        roadType: "Primary",
        length: 0.7,
        coordinates: [
          [51.4571, -0.1927],
          [51.4584, -0.1887]
        ]
      },
      {
        id: "road2",
        osmId: "way/23456789",
        name: "Trinity Road",
        roadType: "Secondary",
        length: 1.2,
        coordinates: [
          [51.4520, -0.1838],
          [51.4602, -0.1780]
        ]
      },
      {
        id: "road3",
        osmId: "way/34567890",
        name: "Garratt Lane",
        roadType: "Secondary",
        length: 1.8,
        coordinates: [
          [51.4482, -0.1922],
          [51.4571, -0.1927]
        ]
      },
      {
        id: "road4",
        osmId: "way/45678901",
        name: "East Hill",
        roadType: "Secondary",
        length: 0.9,
        coordinates: [
          [51.4584, -0.1887],
          [51.4611, -0.1801]
        ]
      },
      {
        id: "road5",
        osmId: "way/56789012",
        name: "Putney Bridge Road",
        roadType: "Secondary",
        length: 0.8,
        coordinates: [
          [51.4611, -0.1801],
          [51.4664, -0.1769]
        ]
      },
      {
        id: "road6",
        osmId: "way/67890123",
        name: "West Hill",
        roadType: "Secondary",
        length: 1.1,
        coordinates: [
          [51.4584, -0.1887],
          [51.4547, -0.2014]
        ]
      },
      {
        id: "road7",
        osmId: "way/78901234",
        name: "Battersea Rise",
        roadType: "Secondary",
        length: 1.3,
        coordinates: [
          [51.4589, -0.1674],
          [51.4611, -0.1801]
        ]
      }
    ];
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
    // In a real implementation, we would query OpenStreetMap Overpass API here
    // For now, return the mock roads that fall within the bounds
    return this.mockRoads.filter(road => {
      // Check if any part of the road falls within the bounds
      return road.coordinates.some(([lat, lng]) => {
        return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
      });
    });
  }
}

export const storage = new MemStorage();
