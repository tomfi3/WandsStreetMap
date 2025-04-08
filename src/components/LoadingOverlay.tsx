import React from 'react';

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Loading Map Data</h2>
          <p className="text-gray-600 text-center">
            Fetching Wandsworth roads and map information...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
