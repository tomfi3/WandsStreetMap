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
};

// Define the Wandsworth borough bounds (using Leaflet LatLngTuple format)
const WANDSWORTH_BOUNDS: L.LatLngBoundsLiteral = [
  [51.4232, -0.2392], // Southwest
  [51.4910, -0.1462], // Northeast
];

// Define the Wandsworth center coordinates
const WANDSWORTH_CENTER: L.LatLngTuple = [51.4571, -0.1927];

// Define the Wandsworth boundary polygon for visual reference
const WANDSWORTH_BOUNDARY: L.LatLngTuple[] = [
  [51.4566, -0.2392],
  [51.4910, -0.2109],
  [51.4851, -0.1681],
  [51.4708, -0.1462],
  [51.4396, -0.1496],
  [51.4232, -0.1814],
  [51.4274, -0.2188],
  [51.4566, -0.2392],
];

// Color mapping for different road types
const ROAD_TYPE_COLORS: Record<string, string> = {
  'Motorway': '#E53E3E', // Red
  'Primary': '#DD6B20', // Orange
  'Secondary': '#D69E2E', // Yellow
  'Tertiary': '#38A169', // Green
  'Residential': '#3182CE', // Blue
  'Service': '#805AD5', // Purple
  'Path': '#718096', // Gray
  'Other': '#A0AEC0', // Light gray
};

const MapContainer: React.FC<MapContainerProps> = ({
  onRoadSelect,
  selectedRoads,
  setMapBounds,
  roads,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const roadLayersRef = useRef<Record<string, L.Polyline>>({});
  const [showAllRoads, setShowAllRoads] = useState(true);

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

    // Add custom button for toggling road visibility
    const buttonContainer = L.DomUtil.create('div', 'leaflet-bottom leaflet-left');
    const buttonControl = L.DomUtil.create('div', 'leaflet-control');
    
    buttonControl.innerHTML = `
      <button 
        class="bg-white p-2 shadow-md rounded-md border border-gray-300 hover:bg-gray-100 text-xs m-2"
        style="width: auto; height: auto; line-height: 1; display: block;"
      >
        ${showAllRoads ? 'Hide Minor Roads' : 'Show All Roads'}
      </button>
    `;
    
    buttonControl.querySelector('button')?.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      setShowAllRoads(!showAllRoads);
    });
    
    buttonContainer.appendChild(buttonControl);
    map.getContainer().appendChild(buttonContainer);

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
  }, [setMapBounds, showAllRoads]);

  // Add roads to map when roads data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing road layers
    Object.values(roadLayersRef.current).forEach((layer) => {
      layer.remove();
    });
    roadLayersRef.current = {};

    // Filter minor roads if needed
    const roadsToDisplay = showAllRoads 
      ? roads 
      : roads.filter(road => {
          return ['Motorway', 'Primary', 'Secondary', 'Tertiary'].includes(road.roadType);
        });

    // Add roads to map
    roadsToDisplay.forEach((road) => {
      const isSelected = !!selectedRoads[road.id];
      const defaultColor = ROAD_TYPE_COLORS[road.roadType] || '#3388ff';
      
      const roadLayer = L.polyline(road.coordinates, {
        color: isSelected ? '#F97316' : defaultColor,
        weight: isSelected ? 6 : road.roadType === 'Primary' ? 4 : road.roadType === 'Secondary' ? 3 : 2,
        opacity: isSelected ? 0.8 : 0.7,
      }).addTo(mapRef.current!);

      // Create a tooltip with road info
      roadLayer.bindTooltip(`
        <strong>${road.name}</strong><br>
        Type: ${road.roadType}<br>
        Length: ${road.length.toFixed(2)} km
      `, { sticky: true });

      // Add click handler to select road
      roadLayer.on('click', () => {
        onRoadSelect(road);
      });

      // Add hover effects
      roadLayer.on('mouseover', () => {
        if (!selectedRoads[road.id]) {
          roadLayer.setStyle({
            weight: road.roadType === 'Primary' ? 6 : road.roadType === 'Secondary' ? 5 : 4,
            opacity: 0.9,
          });
        }
      });

      roadLayer.on('mouseout', () => {
        if (!selectedRoads[road.id]) {
          roadLayer.setStyle({
            weight: road.roadType === 'Primary' ? 4 : road.roadType === 'Secondary' ? 3 : 2,
            opacity: 0.7,
          });
        }
      });

      // Store reference to layer
      roadLayersRef.current[road.id] = roadLayer;
    });
  }, [roads, selectedRoads, onRoadSelect, showAllRoads]);

  // Update road styles when selection changes
  useEffect(() => {
    Object.entries(roadLayersRef.current).forEach(([roadId, layer]) => {
      const isSelected = !!selectedRoads[roadId];
      const road = roads.find(r => r.id === roadId);
      
      if (road) {
        const defaultColor = ROAD_TYPE_COLORS[road.roadType] || '#3388ff';
        
        layer.setStyle({
          color: isSelected ? '#F97316' : defaultColor,
          weight: isSelected ? 6 : road.roadType === 'Primary' ? 4 : road.roadType === 'Secondary' ? 3 : 2,
          opacity: isSelected ? 0.8 : 0.7,
        });
      }
    });
  }, [selectedRoads, roads]);

  return (
    <div 
      ref={mapContainerRef} 
      className="relative w-full h-screen z-10"
      data-testid="map-container"
    />
  );
};

export default MapContainer;
