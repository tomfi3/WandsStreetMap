import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Road } from '@shared/schema';
import { Map, RotateCcw, X, Search } from 'lucide-react';

interface ControlPanelProps {
  selectedRoad: Road | null;
  selectedRoads: Record<string, Road>;
  totalLength: number;
  onReset: () => void;
  onClearSelection: () => void;
  onFocusRoad: () => void;
  isMobile: boolean;
}

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

  return (
    <Card 
      className={`control-panel absolute top-4 right-4 z-20 w-80 md:w-96 bg-white overflow-hidden transition-all duration-300 ${
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
        <p className="text-gray-600 text-sm mb-2">
          Click on any road in Wandsworth to highlight it and view details.
        </p>
        
        <div className="flex space-x-2 mt-3">
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
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Selection
          </Button>
        </div>
      </CardContent>
      
      {selectedRoad && (
        <CardContent className="p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Road Information</h2>
          
          <div className="bg-gray-50 rounded-md p-3 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Name:</span>
              <span className="font-medium text-gray-800">{selectedRoad.name}</span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500 text-sm">Type:</span>
              <span className="font-medium text-gray-800">{selectedRoad.roadType}</span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500 text-sm">Length:</span>
              <span className="font-medium text-gray-800">{selectedRoad.length} km</span>
            </div>
          </div>
          
          <Button 
            className="w-full px-3 py-2 bg-primary hover:bg-blue-600 text-white"
            onClick={onFocusRoad}
          >
            <Search className="h-4 w-4 mr-1" />
            Focus on Road
          </Button>
        </CardContent>
      )}
      
      <CardContent className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Statistics</h3>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Roads Selected:</span>
          <span className="font-medium text-gray-800">{selectedCount}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">Total Road Length:</span>
          <span className="font-medium text-gray-800">
            {totalLength.toFixed(1)} km
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
