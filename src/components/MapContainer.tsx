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
  isLoading,
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

    // Update bounds when map moves, but with some optimizations
    let isMapMoving = false;
    let updateScheduled = false;

    // Only update when movement ends to prevent excessive updates during panning
    map.on('movestart', () => {
      isMapMoving = true;
    });
    
    // Update bounds when map zooms
    map.on('zoomend', () => {
      const newBounds = map.getBounds();
      setMapBounds({
        swLat: newBounds.getSouth(),
        swLng: newBounds.getWest(),
        neLat: newBounds.getNorth(),
        neLng: newBounds.getEast(),
      });
    });

    // Update bounds when movement ends
    map.on('moveend', () => {
      isMapMoving = false;
      
      if (!updateScheduled) {
        updateScheduled = true;
        
        // Use requestAnimationFrame to throttle updates
        requestAnimationFrame(() => {
          const newBounds = map.getBounds();
          setMapBounds({
            swLat: newBounds.getSouth(),
            swLng: newBounds.getWest(),
            neLat: newBounds.getNorth(),
            neLng: newBounds.getEast(),
          });
          updateScheduled = false;
        });
      }
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

    // Debounce the road layer updates for better performance
    let updateTimeout: NodeJS.Timeout | null = null;
    
    const updateRoads = () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      
      updateTimeout = setTimeout(() => {
        // Clear existing road layers when loading new data (but not during initial loading)
        if (!isLoading || Object.keys(roadLayersRef.current).length > 0) {
          Object.values(roadLayersRef.current).forEach((layer) => {
            layer.remove();
          });
          roadLayersRef.current = {};
        }
  
        // Skip rendering during loading unless we don't have any roads displayed
        if (isLoading && Object.keys(roadLayersRef.current).length > 0) {
          return;
        }
        
        // Filter roads by type (major roads if 'showAllRoads' is false)
        // Also limit the total number of roads to prevent performance issues
        const MAX_ROADS_TO_RENDER = 3000;
        
        // Filter by road type
        let filteredRoads = showAllRoads 
          ? roads 
          : roads.filter(road => 
              ['Motorway', 'Primary', 'Secondary', 'Tertiary'].includes(road.roadType)
            );
          
        // Sort roads so major roads appear on top (visually)
        filteredRoads.sort((a, b) => {
          const roadTypeOrder = { 
            'Motorway': 5, 
            'Primary': 4, 
            'Secondary': 3, 
            'Tertiary': 2, 
            'Residential': 1, 
            'Service': 0,
            'Path': -1,
            'Other': -2
          };
          
          return (roadTypeOrder[b.roadType as keyof typeof roadTypeOrder] || -2) - 
                 (roadTypeOrder[a.roadType as keyof typeof roadTypeOrder] || -2);
        });
        
        // Limit number of roads to render
        if (filteredRoads.length > MAX_ROADS_TO_RENDER) {
          console.log(`Too many roads (${filteredRoads.length}), limiting to ${MAX_ROADS_TO_RENDER}`);
          filteredRoads = filteredRoads.slice(0, MAX_ROADS_TO_RENDER);
        }
  
        // Add roads to map efficiently with a batch process
        let batch: Road[] = [];
        const BATCH_SIZE = 300;
        
        const processBatch = (roadBatch: Road[]) => {
          roadBatch.forEach((road) => {
            if (roadLayersRef.current[road.id]) return; // Skip if already added
            
            const isSelected = !!selectedRoads[road.id];
            const defaultColor = ROAD_TYPE_COLORS[road.roadType] || '#3388ff';
            
            const roadLayer = L.polyline(road.coordinates, {
              color: isSelected ? '#F97316' : defaultColor,
              weight: isSelected ? 6 : road.roadType === 'Primary' ? 4 : 
                    road.roadType === 'Secondary' ? 3 : 
                    road.roadType === 'Tertiary' ? 2 : 1.5,
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
                  weight: road.roadType === 'Primary' ? 6 : 
                         road.roadType === 'Secondary' ? 5 : 
                         road.roadType === 'Tertiary' ? 4 : 3,
                  opacity: 0.9,
                });
              }
            });
  
            roadLayer.on('mouseout', () => {
              if (!selectedRoads[road.id]) {
                roadLayer.setStyle({
                  weight: road.roadType === 'Primary' ? 4 : 
                         road.roadType === 'Secondary' ? 3 : 
                         road.roadType === 'Tertiary' ? 2 : 1.5,
                  opacity: 0.7,
                });
              }
            });
  
            // Store reference to layer
            roadLayersRef.current[road.id] = roadLayer;
          });
        };
        
        // Process roads in batches to prevent UI freezing
        filteredRoads.forEach((road, index) => {
          batch.push(road);
          
          if (batch.length === BATCH_SIZE || index === filteredRoads.length - 1) {
            processBatch(batch);
            batch = [];
          }
        });
        
        console.log(`Rendered ${Object.keys(roadLayersRef.current).length} roads on map`);
      }, 100); // Short delay for batching updates
    };
    
    updateRoads();
    
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [roads, selectedRoads, onRoadSelect, isLoading, showAllRoads]);

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
