import React, { useState, useEffect } from 'react';
import { Map } from 'lucide-react';

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  const [loadingText, setLoadingText] = useState('Initializing map data');
  const [dots, setDots] = useState('');
  
  // Create a rotating set of loading messages
  useEffect(() => {
    if (!visible) return;
    
    const loadingMessages = [
      'Fetching road network data',
      'Loading Wandsworth map information',
      'Processing OpenStreetMap data',
      'Analyzing road network',
      'Preparing map visualization'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 3000);
    
    return () => clearInterval(messageInterval);
  }, [visible]);
  
  // Animate loading dots
  useEffect(() => {
    if (!visible) return;
    
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    
    return () => clearInterval(dotsInterval);
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary">
              <Map className="w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Loading Wandsworth Roads
          </h2>
          
          <div className="h-6">
            <p className="text-gray-600 text-center animate-pulse">
              {loadingText}{dots}
            </p>
          </div>
          
          <div className="mt-6 w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full animate-progress"></div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Using real OpenStreetMap data for accurate road geometries
          </p>
        </div>
      </div>
    </div>
  );
};

// Add a custom animation to your global CSS
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes progress {
    0% { width: 5%; }
    50% { width: 80%; }
    100% { width: 95%; }
  }
  
  .animate-progress {
    animation: progress 2s ease-in-out infinite;
  }
`;
document.head.appendChild(styleTag);

export default LoadingOverlay;
