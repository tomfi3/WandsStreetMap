import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Road } from '@shared/schema';
import { Map, RotateCcw, X, Search, Info, List, ChevronDown, ChevronUp, MapPin, Ruler } from 'lucide-react';

interface ControlPanelProps {
  selectedRoad: Road | null;
  selectedRoads: Record<string, Road>;
  totalLength: number;
  onReset: () => void;
  onClearSelection: () => void;
  onFocusRoad: () => void;
  isMobile: boolean;
}

// Color mapping for road type badges
const ROAD_TYPE_COLORS: Record<string, string> = {
  'Motorway': 'bg-red-500',
  'Primary': 'bg-orange-500',
  'Secondary': 'bg-yellow-500',
  'Tertiary': 'bg-green-500',
  'Residential': 'bg-blue-500',
  'Service': 'bg-purple-500',
  'Path': 'bg-gray-500',
  'Other': 'bg-gray-400',
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedRoad,
  selectedRoads,
  totalLength,
  onReset,
  onClearSelection,
  onFocusRoad,
  isMobile,
}) => {
  const selectedCount = Object.keys(selectedRoads).length;
  const [selectedRoadsExpanded, setSelectedRoadsExpanded] = useState(false);
  
  // Sort selected roads by length (descending)
  const sortedSelectedRoads = Object.values(selectedRoads).sort((a, b) => b.length - a.length);

  // Format OSM ID to be more readable and clickable
  const formatOsmId = (osmId: string) => {
    const parts = osmId.split('/');
    if (parts.length === 2) {
      return parts[1];
    }
    return osmId;
  };

  // Create OpenStreetMap link for a road
  const createOsmLink = (osmId: string) => {
    const parts = osmId.split('/');
    if (parts.length === 2) {
      return `https://www.openstreetmap.org/${parts[0]}/${parts[1]}`;
    }
    return `https://www.openstreetmap.org/search?query=${osmId}`;
  };

  return (
    <Card 
      className={`control-panel absolute top-4 right-4 z-20 w-80 md:w-96 bg-white overflow-hidden transition-all duration-300 shadow-lg ${
        isMobile ? 'translate-y-full' : ''
      }`}
    >
      <CardHeader className="p-4 bg-primary text-white">
        <h1 className="text-xl font-semibold flex items-center">
          <Map className="h-6 w-6 mr-2" />
          Wandsworth Road Highlighter
        </h1>
      </CardHeader>
      
      <CardContent className="p-4 border-b border-gray-200">
        <p className="text-gray-600 text-sm mb-3">
          Click on any road in Wandsworth to highlight it and view details.
        </p>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex-1 px-3 py-2 text-sm"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset View
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 px-3 py-2 text-sm"
            disabled={selectedCount === 0}
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Selection
          </Button>
        </div>
      </CardContent>
      
      {selectedRoad && (
        <CardContent className="p-4 border-b border-gray-200">
          <Tabs defaultValue="info">
            <TabsList className="w-full mb-3">
              <TabsTrigger value="info" className="flex-1">
                <Info className="h-4 w-4 mr-1" />
                Details
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                <List className="h-4 w-4 mr-1" />
                All Selected ({selectedCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-0">
              <div className="flex items-center mb-3">
                <h2 className="text-lg font-medium text-gray-800">{selectedRoad.name}</h2>
                <Badge 
                  className={`ml-2 ${ROAD_TYPE_COLORS[selectedRoad.roadType] || 'bg-gray-500'}`}
                >
                  {selectedRoad.roadType}
                </Badge>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3 mb-3 text-sm">
                <div className="flex items-start mb-2">
                  <Ruler className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500">Length</div>
                    <div className="font-medium text-gray-800">{selectedRoad.length.toFixed(2)} km</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500">OSM ID</div>
                    <a 
                      href={createOsmLink(selectedRoad.osmId)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {formatOsmId(selectedRoad.osmId)}
                    </a>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full px-3 py-2 bg-primary hover:bg-blue-600 text-white"
                onClick={onFocusRoad}
              >
                <Search className="h-4 w-4 mr-1" />
                Focus on Road
              </Button>
            </TabsContent>
            
            <TabsContent value="all" className="mt-0">
              {selectedCount > 0 ? (
                <div className="max-h-60 overflow-y-auto pr-1">
                  <ul className="space-y-2">
                    {sortedSelectedRoads.map((road) => (
                      <li 
                        key={road.id} 
                        className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          onFocusRoad();
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-gray-800 truncate mr-2" title={road.name}>
                            {road.name}
                          </div>
                          <Badge 
                            className={`${ROAD_TYPE_COLORS[road.roadType] || 'bg-gray-500'} min-w-min text-xs`}
                          >
                            {road.roadType}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Length: {road.length.toFixed(2)} km
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No roads selected yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
      
      <CardFooter className="p-4 bg-gray-50 block">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Statistics</h3>
          
          {selectedCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto"
              onClick={() => setSelectedRoadsExpanded(!selectedRoadsExpanded)}
            >
              {selectedRoadsExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-white rounded-md p-2">
            <div className="text-xs text-gray-500">Roads Selected</div>
            <div className="font-medium text-gray-800 text-lg">{selectedCount}</div>
          </div>
          
          <div className="bg-white rounded-md p-2">
            <div className="text-xs text-gray-500">Total Length</div>
            <div className="font-medium text-gray-800 text-lg">
              {totalLength.toFixed(1)} km
            </div>
          </div>
        </div>
        
        {selectedRoadsExpanded && selectedCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Road Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(
                sortedSelectedRoads.reduce((acc, road) => {
                  acc[road.roadType] = (acc[road.roadType] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${ROAD_TYPE_COLORS[type] || 'bg-gray-500'} mr-2`}></div>
                  <div className="text-xs text-gray-700">
                    {type}: <span className="font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ControlPanel;
