import { FiLock, FiCreditCard, FiArrowLeft, FiUser } from 'react-icons/fi';
import { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '../utils/subscription';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth';

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
  visiblePercent = 15 // Show only 15% of content by default (85% blurred)
}: BlurOverlayProps) {
  const { subscribe, isSubscribed } = useSubscription();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
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
  
  // Calculate visible height - show only small portion at the top
  const visibleHeight = Math.max(
    Math.min(contentHeight * (visiblePercent / 100), 500), // Max 500px visible
    200 // Minimum 200px visible even if content is small
  );
  
  return (
    <div className="relative">
      {/* Container for content with ref to measure height */}
      <div
        ref={setContainerRef} 
        className="relative overflow-hidden"
        style={{ 
          maxHeight: `${visibleHeight}px`
        }}
      >
        {/* Content with light blur filter applied */}
        <div className="filter blur-[1px] opacity-95">
          {children}
        </div>
      </div>
      
      {/* Very light gradient overlay - non-interactive */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/50 z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none"></div>
      
      {/* Subscription CTA - highest z-index for clickable buttons */}
      <div className="relative z-30 py-8 text-center bg-white">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-2 mx-auto">
            <FiLock className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isAuthenticated() ? (
            <>
              <button 
                className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                onClick={onUpgrade || (() => {
                  const event = new CustomEvent('openLoginModal');
                  document.dispatchEvent(event);
                })}
              >
                <FiUser className="mr-2 h-4 w-4" />
                Log In
              </button>
              <button 
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => router.back()}
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </button>
            </>
          ) : (
            <>
              <button 
                className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                onClick={handleUpgrade}
              >
                <FiCreditCard className="mr-2 h-4 w-4" />
                Subscribe Now
              </button>
              <button 
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => router.back()}
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
