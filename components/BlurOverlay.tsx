import { FiLock, FiCreditCard } from 'react-icons/fi';
import { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '../utils/subscription';

type BlurOverlayProps = {
  message?: string;
  onUpgrade?: () => void;
  children?: ReactNode;
  visiblePercent?: number;
};

export default function BlurOverlay({ 
  message = 'Subscribe to see full content',
  onUpgrade, 
  children,
  visiblePercent = 20
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
      subscribe('premium', 'active');
    }
  };
  
  // If user is subscribed, show full content
  if (isSubscribed) {
    return <>{children}</>;
  }
  
  // Calculate visible height (20% of content)
  const visibleHeight = contentHeight * (visiblePercent / 100);
  
  return (
    <div className="relative">
      {/* Container for content with ref to measure height */}
      <div
        ref={setContainerRef} 
        className="relative overflow-hidden"
        style={{ maxHeight: visibleHeight > 0 ? `${visibleHeight}px` : undefined }}
      >
        {children}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-10"></div>
      
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
