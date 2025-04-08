import React from 'react';
import { Button } from '@/components/ui/button';

interface TutorialProps {
  visible: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">How to Use</h2>
        
        <ul className="space-y-2 mb-4">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-primary text-white rounded-full h-5 w-5 text-xs mr-2 mt-0.5">1</span>
            <span className="text-gray-700">Click on any road in Wandsworth to highlight it</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-primary text-white rounded-full h-5 w-5 text-xs mr-2 mt-0.5">2</span>
            <span className="text-gray-700">View road details in the info panel</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-primary text-white rounded-full h-5 w-5 text-xs mr-2 mt-0.5">3</span>
            <span className="text-gray-700">Select multiple roads to compare</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-primary text-white rounded-full h-5 w-5 text-xs mr-2 mt-0.5">4</span>
            <span className="text-gray-700">Use the reset button to clear your selection</span>
          </li>
        </ul>
        
        <Button 
          className="w-full" 
          onClick={onClose}
        >
          Got it!
        </Button>
      </div>
    </div>
  );
};

export default Tutorial;
