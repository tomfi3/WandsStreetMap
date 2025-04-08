import React, { useState, useEffect, useCallback } from 'react';
import MapContainer from '@/components/MapContainer';
import ControlPanel from '@/components/ControlPanel';
import MobileControls from '@/components/MobileControls';
import LoadingOverlay from '@/components/LoadingOverlay';
import Tutorial from '@/components/Tutorial';
import { useRoadsByBounds } from '@/hooks/useMapData';
import { Road } from '@shared/schema';

// Define the Wandsworth center coordinates
const WANDSWORTH_CENTER: [number, number] = [51.4571, -0.1927];

// Define the Wandsworth bounds
const WANDSWORTH_BOUNDS = [
  [51.4232, -0.2392], // Southwest
  [51.4910, -0.1462], // Northeast
];

const Home: React.FC = () => {
  // App state
  const [selectedRoads, setSelectedRoads] = useState<Record<string, Road>>({});
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [totalLength, setTotalLength] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPanelVisible, setIsPanelVisible] = useState(!isMobile);
  const [mapBounds, setMapBounds] = useState<{
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  } | null>(null);

  // Fetch roads data
  const { data: roadsData, isLoading } = useRoadsByBounds(mapBounds);
  const roads = roadsData?.roads || [];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsPanelVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate total length when selectedRoads changes
  useEffect(() => {
    const length = Object.values(selectedRoads).reduce((total, road) => total + road.length, 0);
    setTotalLength(length);
  }, [selectedRoads]);

  // Handle road selection
  const handleRoadSelect = useCallback((road: Road | null) => {
    if (!road) return;

    setSelectedRoads((prev) => {
      const newSelectedRoads = { ...prev };
      
      if (newSelectedRoads[road.id]) {
        delete newSelectedRoads[road.id];
      } else {
        newSelectedRoads[road.id] = road;
      }
      
      return newSelectedRoads;
    });

    // Set the most recently selected road for display in the control panel
    setSelectedRoad(road);
  }, []);

  // Reset map view
  const handleResetView = useCallback(() => {
    if (mapBounds) {
      // Reset to the original Wandsworth bounds
      setMapBounds({
        swLat: WANDSWORTH_BOUNDS[0][0],
        swLng: WANDSWORTH_BOUNDS[0][1],
        neLat: WANDSWORTH_BOUNDS[1][0],
        neLng: WANDSWORTH_BOUNDS[1][1],
      });
    }
  }, [mapBounds]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedRoads({});
    setSelectedRoad(null);
  }, []);

  // Focus on selected road
  const handleFocusRoad = useCallback(() => {
    if (selectedRoad && selectedRoad.coordinates.length > 0) {
      // Calculate bounds from road coordinates
      const lats = selectedRoad.coordinates.map(coord => coord[0]);
      const lngs = selectedRoad.coordinates.map(coord => coord[1]);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Add a small padding
      const padding = 0.005;
      
      setMapBounds({
        swLat: minLat - padding,
        swLng: minLng - padding,
        neLat: maxLat + padding,
        neLng: maxLng + padding,
      });
    }
  }, [selectedRoad]);

  // Toggle control panel visibility on mobile
  const handleToggleControlPanel = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MapContainer
        onRoadSelect={handleRoadSelect}
        selectedRoads={selectedRoads}
        setMapBounds={setMapBounds}
        roads={roads}
        isLoading={isLoading}
      />
      
      <ControlPanel
        selectedRoad={selectedRoad}
        selectedRoads={selectedRoads}
        totalLength={totalLength}
        onReset={handleResetView}
        onClearSelection={handleClearSelection}
        onFocusRoad={handleFocusRoad}
        isMobile={isMobile && !isPanelVisible}
      />
      
      <MobileControls
        onToggleControlPanel={handleToggleControlPanel}
        onReset={handleResetView}
      />
      
      <LoadingOverlay visible={isLoading} />
      
      <div 
        data-testid="tutorial-button" 
        className="hidden" 
        onClick={() => setShowTutorial(true)}
      ></div>
      
      <Tutorial
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};

export default Home;
