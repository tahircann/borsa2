import { FiLock, FiCreditCard } from 'react-icons/fi';
import { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '../utils/subscription';

type BlurOverlayProps = {
  message?: string;
  onUpgrade?: () => void;
  children?: ReactNode;
  visiblePercent?: number;
  fullPageBlur?: boolean; // New prop for full page blur
};

export default function BlurOverlay({ 
  message = 'Subscribe to see full content',
  onUpgrade, 
  children,
  visiblePercent = 15, // Show only 15% of content by default (85% blurred)
  fullPageBlur = false
}: BlurOverlayProps) {
  const { subscribe, isSubscribed } = useSubscription();
  const [contentHeight, setContentHeight] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (containerRef) {
      setContentHeight(containerRef.scrollHeight);
    }
  }, [containerRef, children]);
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      subscribe('premium');
    }
  };
  
  // If user is subscribed, show full content
  if (isSubscribed) {
    return <>{children}</>;
  }
  
  // Full page blur mode - covers entire viewport
  if (fullPageBlur) {
    return (
      <div className="relative min-h-screen">
        {/* Content with heavy blur */}
        <div className="filter blur-md opacity-30">
          {children}
        </div>
        
        {/* Full page overlay */}
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-3 mx-auto mb-4">
                <FiLock className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Content</h2>
              <p className="text-gray-600">{message}</p>
            </div>
            
            <button 
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              onClick={handleUpgrade}
            >
              <FiCreditCard className="mr-2 h-5 w-5" />
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Original partial blur mode
  const visibleHeight = Math.min(contentHeight * (visiblePercent / 100), 300); // Max 300px visible
  
  return (
    <div className="relative">
      {/* Container for content with ref to measure height */}
      <div
        ref={setContainerRef} 
        className="relative overflow-hidden"
        style={{ 
          maxHeight: visibleHeight > 0 ? `${visibleHeight}px` : '200px' // Default to 200px if no content height
        }}
      >
        {/* Content with blur filter applied */}
        <div className="filter blur-sm">
          {children}
        </div>
      </div>
      
      {/* Strong gradient overlay that covers most of the visible area */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-20"></div>
      
      {/* Subscription CTA */}
      <div className="py-8 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-2 mx-auto">
            <FiLock className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <button 
          className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          onClick={handleUpgrade}
        >
          <FiCreditCard className="mr-2 h-4 w-4" />
          Subscribe Now
        </button>
      </div>
    </div>
  );
}
