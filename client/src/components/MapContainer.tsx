import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Road } from '@shared/schema';

type MapContainerProps = {
  onRoadSelect: (road: Road | null) => void;
  selectedRoads: Record<string, Road>;
  setMapBounds: (bounds: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  }) => void;
  roads: Road[];
  isLoading: boolean;
};

// Define the Wandsworth borough bounds
const WANDSWORTH_BOUNDS = [
  [51.4232, -0.2392], // Southwest
  [51.4910, -0.1462], // Northeast
];

// Define the Wandsworth center coordinates
const WANDSWORTH_CENTER: [number, number] = [51.4571, -0.1927];

// Define the Wandsworth boundary polygon for visual reference
const WANDSWORTH_BOUNDARY = [
  [51.4566, -0.2392],
  [51.4910, -0.2109],
  [51.4851, -0.1681],
  [51.4708, -0.1462],
  [51.4396, -0.1496],
  [51.4232, -0.1814],
  [51.4274, -0.2188],
  [51.4566, -0.2392],
];

const MapContainer: React.FC<MapContainerProps> = ({
  onRoadSelect,
  selectedRoads,
  setMapBounds,
  roads,
  isLoading,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const roadLayersRef = useRef<Record<string, L.Polyline>>({});

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: WANDSWORTH_CENTER,
      zoom: 14,
      minZoom: 12,
      maxZoom: 19,
      maxBounds: WANDSWORTH_BOUNDS,
      maxBoundsViscosity: 0.9,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add Wandsworth borough boundary
    const boundaryStyle = {
      color: '#3B82F6',
      weight: 3,
      opacity: 0.7,
      fill: true,
      fillColor: '#3B82F6',
      fillOpacity: 0.05,
    };

    L.polygon(WANDSWORTH_BOUNDARY, boundaryStyle).addTo(map);

    // Set map reference
    mapRef.current = map;

    // Set initial bounds
    const bounds = map.getBounds();
    setMapBounds({
      swLat: bounds.getSouth(),
      swLng: bounds.getWest(),
      neLat: bounds.getNorth(),
      neLng: bounds.getEast(),
    });

    // Update bounds when map moves
    map.on('moveend', () => {
      const newBounds = map.getBounds();
      setMapBounds({
        swLat: newBounds.getSouth(),
        swLng: newBounds.getWest(),
        neLat: newBounds.getNorth(),
        neLng: newBounds.getEast(),
      });
    });

    // Clean up on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [setMapBounds]);

  // Add roads to map when roads data changes
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Clear existing road layers
    Object.values(roadLayersRef.current).forEach((layer) => {
      layer.remove();
    });
    roadLayersRef.current = {};

    // Add roads to map
    roads.forEach((road) => {
      const roadLayer = L.polyline(road.coordinates, {
        color: selectedRoads[road.id] ? '#F97316' : '#3388ff',
        weight: selectedRoads[road.id] ? 6 : 3,
        opacity: selectedRoads[road.id] ? 0.8 : 0.7,
      }).addTo(mapRef.current!);

      // Add click handler to select road
      roadLayer.on('click', () => {
        onRoadSelect(road);
      });

      // Add hover effects
      roadLayer.on('mouseover', () => {
        if (!selectedRoads[road.id]) {
          roadLayer.setStyle({
            weight: 5,
            opacity: 0.9,
          });
        }
      });

      roadLayer.on('mouseout', () => {
        if (!selectedRoads[road.id]) {
          roadLayer.setStyle({
            weight: 3,
            opacity: 0.7,
          });
        }
      });

      // Store reference to layer
      roadLayersRef.current[road.id] = roadLayer;
    });
  }, [roads, selectedRoads, onRoadSelect, isLoading]);

  // Update road styles when selection changes
  useEffect(() => {
    Object.entries(roadLayersRef.current).forEach(([roadId, layer]) => {
      const isSelected = !!selectedRoads[roadId];
      
      layer.setStyle({
        color: isSelected ? '#F97316' : '#3388ff',
        weight: isSelected ? 6 : 3,
        opacity: isSelected ? 0.8 : 0.7,
      });
    });
  }, [selectedRoads]);

  return (
    <div 
      ref={mapContainerRef} 
      className="relative w-full h-screen z-10"
      data-testid="map-container"
    />
  );
};

export default MapContainer;
