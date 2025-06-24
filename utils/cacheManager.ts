// Client-side Cache Manager
// Provides additional automation and monitoring for the cache system

interface CacheStatus {
  lastUpdate: string;
  nextUpdate: string;
  status: 'fresh' | 'stale' | 'updating';
  cached: boolean;
}

interface CacheManagerOptions {
  autoRefreshInterval?: number; // milliseconds
  enableAutoRefresh?: boolean;
  onRefreshSuccess?: (status: CacheStatus) => void;
  onRefreshError?: (error: Error) => void;
  onStatusChange?: (status: CacheStatus) => void;
}

class CacheManager {
  private options: CacheManagerOptions;
  private refreshTimer: NodeJS.Timeout | null = null;
  private statusCheckTimer: NodeJS.Timeout | null = null;
  private currentStatus: CacheStatus | null = null;

  constructor(options: CacheManagerOptions = {}) {
    this.options = {
      autoRefreshInterval: 4 * 60 * 60 * 1000, // 4 hours default
      enableAutoRefresh: false, // Disabled by default to prevent conflicts with server-side automation
      ...options
    };
  }

  /**
   * Initialize the cache manager
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing Cache Manager...');
    
    try {
      await this.checkCacheStatus();
      
      if (this.options.enableAutoRefresh) {
        this.startAutoRefresh();
      }
      
      // Start periodic status checks (every 30 seconds)
      this.startStatusChecking();
      
      console.log('✅ Cache Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Cache Manager:', error);
    }
  }

  /**
   * Check current cache status
   */
  async checkCacheStatus(): Promise<CacheStatus | null> {
    try {
      const response = await fetch('/api/cache');
      if (response.ok) {
        const status: CacheStatus = await response.json();
        
        if (this.currentStatus?.status !== status.status) {
          console.log(`📊 Cache status changed: ${this.currentStatus?.status} → ${status.status}`);
          this.options.onStatusChange?.(status);
        }
        
        this.currentStatus = status;
        return status;
      } else {
        console.warn('⚠️ Failed to check cache status:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking cache status:', error);
      return null;
    }
  }

  /**
   * Manually refresh the cache
   */
  async refreshCache(): Promise<boolean> {
    try {
      console.log('🔄 Manually refreshing cache...');
      
      const response = await fetch('/api/cache-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cache refresh successful:', result);
        
        // Update status after successful refresh
        await this.checkCacheStatus();
        
        this.options.onRefreshSuccess?.(this.currentStatus!);
        return true;
      } else {
        const error = new Error(`Cache refresh failed: ${response.statusText}`);
        console.error('❌ Cache refresh failed:', error);
        this.options.onRefreshError?.(error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error during cache refresh:', error);
      this.options.onRefreshError?.(error as Error);
      return false;
    }
  }

  /**
   * Check if cache needs refresh based on age
   */
  shouldRefreshCache(): boolean {
    if (!this.currentStatus) return false;

    const lastUpdate = new Date(this.currentStatus.lastUpdate);
    const now = new Date();
    const age = now.getTime() - lastUpdate.getTime();

    // Refresh if cache is older than the configured interval
    return age > (this.options.autoRefreshInterval || 4 * 60 * 60 * 1000);
  }

  /**
   * Start automatic refresh timer
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    console.log(`⏰ Starting auto-refresh every ${(this.options.autoRefreshInterval! / 1000 / 60).toFixed(0)} minutes`);

    this.refreshTimer = setInterval(async () => {
      if (this.shouldRefreshCache()) {
        console.log('⏰ Auto-refresh triggered');
        await this.refreshCache();
      }
    }, this.options.autoRefreshInterval);
  }

  /**
   * Start periodic status checking
   */
  private startStatusChecking(): void {
    if (this.statusCheckTimer) {
      clearInterval(this.statusCheckTimer);
    }

    // Check status every 30 seconds
    this.statusCheckTimer = setInterval(async () => {
      await this.checkCacheStatus();
    }, 30000);
  }

  /**
   * Stop all timers
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.statusCheckTimer) {
      clearInterval(this.statusCheckTimer);
      this.statusCheckTimer = null;
    }

    console.log('🛑 Cache Manager destroyed');
  }

  /**
   * Get current cache status
   */
  getCurrentStatus(): CacheStatus | null {
    return this.currentStatus;
  }

  /**
   * Get cache age in minutes
   */
  getCacheAgeMinutes(): number | null {
    if (!this.currentStatus) return null;

    const lastUpdate = new Date(this.currentStatus.lastUpdate);
    const now = new Date();
    return Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
  }

  /**
   * Get time until next refresh in minutes
   */
  getTimeUntilRefreshMinutes(): number | null {
    if (!this.currentStatus) return null;

    const nextUpdate = new Date(this.currentStatus.nextUpdate);
    const now = new Date();
    const diff = nextUpdate.getTime() - now.getTime();
    
    return diff > 0 ? Math.floor(diff / (1000 * 60)) : 0;
  }
}

// Create a singleton instance
let cacheManagerInstance: CacheManager | null = null;

/**
 * Get the global cache manager instance
 */
export function getCacheManager(options?: CacheManagerOptions): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager(options);
  }
  return cacheManagerInstance;
}

/**
 * Initialize cache manager with default settings
 */
export function initializeCacheManager(options?: CacheManagerOptions): Promise<void> {
  const manager = getCacheManager(options);
  return manager.initialize();
}

/**
 * Utility function for manual cache refresh
 */
export function refreshCache(): Promise<boolean> {
  const manager = getCacheManager();
  return manager.refreshCache();
}

/**
 * Utility function to check cache status
 */
export function checkCacheStatus(): Promise<CacheStatus | null> {
  const manager = getCacheManager();
  return manager.checkCacheStatus();
}

export default CacheManager; 