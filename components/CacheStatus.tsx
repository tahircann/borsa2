import { useState, useEffect } from 'react';
import { FiRefreshCw, FiClock, FiDatabase } from 'react-icons/fi';

interface CacheInfo {
  lastUpdate: string;
  nextUpdate: string;
  status: 'fresh' | 'stale' | 'updating';
  cached: boolean;
}

export default function CacheStatus() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCacheInfo = async () => {
    try {
      const response = await fetch('/api/cache');
      if (response.ok) {
        const data = await response.json();
        setCacheInfo(data);
        setError(null);
      } else {
        setError('Cache not available');
      }
    } catch (error) {
      console.error('Error fetching cache info:', error);
      setError('Failed to fetch cache info');
    }
  };

  const refreshCache = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/cache', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setCacheInfo(result);
        setError(null);
      } else {
        setError('Cache refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      setError('Failed to refresh cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCacheInfo();
    // Refresh cache info every 30 seconds
    const interval = setInterval(fetchCacheInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
        <div className="flex items-center text-gray-600">
          <FiDatabase className="mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!cacheInfo) {
    return null;
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'text-green-600';
      case 'stale': return 'text-yellow-600';
      case 'updating': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return '✅';
      case 'stale': return '⚠️';
      case 'updating': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FiDatabase className="mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Cache Status:</span>
            <span className={`ml-2 text-sm font-semibold ${getStatusColor(cacheInfo.status)}`}>
              {getStatusIcon(cacheInfo.status)} {cacheInfo.status.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <FiClock className="mr-1" />
            <span className="text-xs">
              Updated: {formatTime(cacheInfo.lastUpdate)}
            </span>
          </div>
        </div>

        <button
          onClick={refreshCache}
          disabled={isRefreshing || cacheInfo.status === 'updating'}
          className="flex items-center px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
        >
          <FiRefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {cacheInfo.nextUpdate && (
        <div className="mt-2 text-xs text-gray-500">
          Next automatic update: {formatTime(cacheInfo.nextUpdate)}
        </div>
      )}
    </div>
  );
} 