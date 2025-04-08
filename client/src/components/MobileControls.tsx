import React, { useState, useEffect } from 'react';
import { Menu, RotateCcw, MapPin, ZoomIn, ChevronUp, HelpCircle } from 'lucide-react';

interface MobileControlsProps {
  onToggleControlPanel: () => void;
  onReset: () => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onToggleControlPanel,
  onReset,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // On first load, briefly show the expanded controls and hide after a delay
  useEffect(() => {
    if (isInitialLoad) {
      setExpanded(true);
      
      const timer = setTimeout(() => {
        setExpanded(false);
        setIsInitialLoad(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);
  
  // Basic controls always shown
  const basicControls = (
    <>
      <button
        onClick={onToggleControlPanel}
        className="flex-1 py-3 px-2 text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center transition-colors"
      >
        <Menu className="h-5 w-5 mb-1" />
        <span className="text-xs">Controls</span>
      </button>
      
      <button
        onClick={onReset}
        className="flex-1 py-3 px-2 text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center border-l border-gray-200 transition-colors"
      >
        <RotateCcw className="h-5 w-5 mb-1" />
        <span className="text-xs">Reset</span>
      </button>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex-1 py-3 px-2 text-primary hover:bg-gray-100 flex flex-col items-center justify-center border-l border-gray-200 transition-colors"
      >
        <ChevronUp className={`h-5 w-5 mb-1 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        <span className="text-xs">{expanded ? 'Less' : 'More'}</span>
      </button>
    </>
  );
  
  // Extended controls shown when expanded
  const expandedControls = (
    <div className="flex justify-between items-center border-t border-gray-200">
      <button
        className="flex-1 py-3 px-2 text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center transition-colors"
        onClick={() => window.open('https://www.openstreetmap.org/relation/34837', '_blank')}
      >
        <MapPin className="h-5 w-5 mb-1" />
        <span className="text-xs">OpenStreetMap</span>
      </button>
      
      <button
        className="flex-1 py-3 px-2 text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center border-l border-gray-200 transition-colors"
        onClick={() => window.location.reload()}
      >
        <ZoomIn className="h-5 w-5 mb-1" />
        <span className="text-xs">Refresh Data</span>
      </button>
      
      <button
        className="flex-1 py-3 px-2 text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center border-l border-gray-200 transition-colors"
        onClick={() => document.querySelector('div[data-testid="tutorial-button"]')?.dispatchEvent(new Event('click'))}
      >
        <HelpCircle className="h-5 w-5 mb-1" />
        <span className="text-xs">Help</span>
      </button>
    </div>
  );
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-xl z-30 border-t border-gray-200 rounded-t-xl overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-center">
        {basicControls}
      </div>
      
      {expanded && expandedControls}
      
      {/* Visual indicator for swipe up */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
    </div>
  );
};

export default MobileControls;
