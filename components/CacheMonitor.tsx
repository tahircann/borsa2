import { useState, useEffect } from 'react';
import { FiRefreshCw, FiClock, FiDatabase, FiActivity, FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';
import { getCacheManager } from '../utils/cacheManager';

interface CacheStats {
  status: 'fresh' | 'stale' | 'updating';
  lastUpdate: string;
  nextUpdate: string;
  ageMinutes: number | null;
  timeUntilRefreshMinutes: number | null;
}

interface CacheMonitorProps {
  showDetailed?: boolean;
  compact?: boolean;
}

export default function CacheMonitor({ showDetailed = false, compact = false }: CacheMonitorProps) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!compact);

  const updateStats = async () => {
    try {
      const manager = getCacheManager();
      const status = await manager.checkCacheStatus();
      
      if (status) {
        setStats({
          status: status.status,
          lastUpdate: status.lastUpdate,
          nextUpdate: status.nextUpdate,
          ageMinutes: manager.getCacheAgeMinutes(),
          timeUntilRefreshMinutes: manager.getTimeUntilRefreshMinutes()
        });
        setError(null);
      }
    } catch (error) {
      console.error('Error updating cache stats:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const manager = getCacheManager();
      const success = await manager.refreshCache();
      if (success) {
        await updateStats();
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      setError(error instanceof Error ? error.message : 'Refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    updateStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <FiCheckCircle className="text-green-500" />;
      case 'stale': return <FiAlertTriangle className="text-yellow-500" />;
      case 'updating': return <FiRefreshCw className="text-blue-500 animate-spin" />;
      default: return <FiDatabase className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'text-green-600 bg-green-50 border-green-200';
      case 'stale': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'updating': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'Unknown';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (compact && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Show Cache Monitor"
      >
        <FiActivity className="w-5 h-5" />
      </button>
    );
  }

  if (!stats && !error) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
        <div className="flex items-center text-gray-600">
          <FiDatabase className="mr-2 animate-pulse" />
          <span className="text-sm">Loading cache status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm mb-4 ${compact ? 'fixed bottom-4 right-4 w-80 z-50' : ''}`}>
      {compact && (
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">Cache Monitor</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="p-4">
        {error ? (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2" />
              <span className="text-sm font-medium">Cache Error</span>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : stats ? (
          <>
            {/* Status Overview */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(stats.status)}
                <span className={`text-sm font-semibold px-2 py-1 rounded-full border ${getStatusColor(stats.status)}`}>
                  {stats.status.toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || stats.status === 'updating'}
                className="flex items-center px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
              >
                <FiRefreshCw className={`mr-1 w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Cache Age</div>
                <div className="font-medium">{formatDuration(stats.ageMinutes)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Next Refresh</div>
                <div className="font-medium">{formatDuration(stats.timeUntilRefreshMinutes)}</div>
              </div>
            </div>

            {showDetailed && (
              <>
                {/* Detailed Information */}
                <div className="border-t pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Update:</span>
                    <span className="font-mono">{formatTime(stats.lastUpdate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next Update:</span>
                    <span className="font-mono">{formatTime(stats.nextUpdate)}</span>
                  </div>
                </div>

                {/* Health Indicators */}
                <div className="border-t pt-3">
                  <div className="text-xs text-gray-500 mb-2">System Health</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                        stats.status === 'fresh' ? 'bg-green-500' : 
                        stats.status === 'stale' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>Cache</div>
                    </div>
                    <div className="text-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <div>API</div>
                    </div>
                    <div className="text-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <div>Server</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
} 