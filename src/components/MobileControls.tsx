import React from 'react';
import { Menu, RotateCcw } from 'lucide-react';

interface MobileControlsProps {
  onToggleControlPanel: () => void;
  onReset: () => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onToggleControlPanel,
  onReset,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-30 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <button
          onClick={onToggleControlPanel}
          className="flex-1 p-4 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
        >
          <Menu className="h-5 w-5 mr-2" />
          Controls
        </button>
        
        <button
          onClick={onReset}
          className="flex-1 p-4 text-gray-700 hover:bg-gray-100 flex items-center justify-center border-l border-gray-200"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
