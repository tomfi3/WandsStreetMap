import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  MousePointer, 
  ZoomIn, 
  MapPin, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Layers, 
  Info, 
  ChevronRight 
} from 'lucide-react';

interface TutorialProps {
  visible: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('basics');
  
  // Add ESC key handler to close tutorial
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [visible, onClose]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary/10 to-white">
          <div className="flex items-center">
            <div className="bg-primary text-white p-2 rounded-lg mr-3">
              <Map className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Wandsworth Road Highlighter</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors flex items-center font-medium"
              aria-label="Skip tutorial"
            >
              Skip
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-colors flex items-center justify-center"
              aria-label="Close tutorial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="basics" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-6 pt-4">
            <div className="flex flex-col space-y-3">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="tips">Pro Tips</TabsTrigger>
              </TabsList>
              
              <div className="w-full text-center">
                <button
                  className="text-primary font-medium text-sm hover:underline"
                  onClick={onClose}
                >
                  Skip Tutorial →
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-180px)]">
            <TabsContent value="basics" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <MousePointer className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Select Roads</h3>
                    <p className="text-gray-600 text-sm">Click on any road on the map to highlight it. Click again to deselect.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">View Details</h3>
                    <p className="text-gray-600 text-sm">Road information including type, length, and OpenStreetMap data will appear in the panel.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Multiple Selection</h3>
                    <p className="text-gray-600 text-sm">Select multiple roads to compare lengths and analyze the road network.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Reset & Clear</h3>
                    <p className="text-gray-600 text-sm">Use the reset button to return to the original view, or clear selection to remove highlights.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between">
                <div></div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary flex items-center"
                  onClick={() => setActiveTab('features')}
                >
                  Next: Features <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Road Types</h3>
                    <p className="text-gray-600 text-sm">Roads are color-coded by type: motorways, primary, secondary, residential, and more.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <ZoomIn className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Focus Mode</h3>
                    <p className="text-gray-600 text-sm">Use "Focus on Road" to zoom the map to a selected road for a better view.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Show/Hide Minor Roads</h3>
                    <p className="text-gray-600 text-sm">Toggle the visibility of minor roads to focus on major routes.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <EyeOff className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Statistics View</h3>
                    <p className="text-gray-600 text-sm">Review total length and road type distribution in the statistics panel.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary flex items-center"
                  onClick={() => setActiveTab('basics')}
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back: Basics
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary flex items-center"
                  onClick={() => setActiveTab('tips')}
                >
                  Next: Pro Tips <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="tips" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Real OpenStreetMap Data</h3>
                  <p className="text-gray-600 text-sm">This application uses actual OpenStreetMap road data for accurate representation of Wandsworth's road network.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">OpenStreetMap Links</h3>
                  <p className="text-gray-600 text-sm">Click on the OSM ID in road details to open the official OpenStreetMap page for that road.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Road Length Calculation</h3>
                  <p className="text-gray-600 text-sm">Road lengths are calculated using the Haversine formula on the actual road geometry for accurate distance measurement in kilometers.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Mobile Friendly</h3>
                  <p className="text-gray-600 text-sm">Use the mobile controls at the bottom of the screen on smaller devices to toggle the control panel.</p>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary flex items-center"
                  onClick={() => setActiveTab('features')}
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back: Features
                </Button>
                
                <div></div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col items-center">
          <div className="w-full relative">
            <Button 
              size="lg"
              className="w-full mb-2 bg-primary hover:bg-primary/90 text-white font-bold py-6 text-xl shadow-lg border-2 border-primary" 
              onClick={onClose}
            >
              <span className="animate-pulse">Click to Get Started</span>
            </Button>
            <span className="w-full text-center block text-sm text-gray-600 font-medium">or press ESC to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
