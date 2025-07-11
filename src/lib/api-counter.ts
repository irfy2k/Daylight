export interface ApiUsage {
  count: number;
  resetTime: number; // timestamp when counter resets
  lastRequest: number; // timestamp of last request
  totalGlobalRequests: number; // total requests made by all users
}

const API_LIMIT_PER_HOUR = 60;
const GLOBAL_STORAGE_KEY = 'daylight_global_api_usage';

// Get the next hour boundary (e.g., if it's 2:30 PM, return 3:00 PM)
function getNextHourBoundary(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Set to next hour, 0 minutes, 0 seconds, 0 ms
  return nextHour.getTime();
}

// Check if we've crossed an hour boundary
function shouldResetCounter(resetTime: number): boolean {
  return Date.now() >= resetTime;
}

export function getApiUsage(): ApiUsage {
  if (typeof window === 'undefined') {
    return { 
      count: 0, 
      resetTime: Date.now() + (60 * 60 * 1000), 
      lastRequest: 0,
      totalGlobalRequests: 0
    };
  }

  const stored = localStorage.getItem(GLOBAL_STORAGE_KEY);
  const currentTime = Date.now();
  
  if (!stored) {
    const newUsage: ApiUsage = {
      count: 0,
      resetTime: getNextHourBoundary(),
      lastRequest: 0,
      totalGlobalRequests: 0
    };
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(newUsage));
    return newUsage;
  }

  const usage: ApiUsage = JSON.parse(stored);
  
  // Check if we need to reset the counter
  if (shouldResetCounter(usage.resetTime)) {
    const resetUsage: ApiUsage = {
      count: 0,
      resetTime: getNextHourBoundary(),
      lastRequest: usage.lastRequest,
      totalGlobalRequests: usage.totalGlobalRequests
    };
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(resetUsage));
    
    // Broadcast reset event to other tabs/windows
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('globalApiCounterReset', { detail: resetUsage }));
    }
    
    return resetUsage;
  }

  return usage;
}

export function incrementApiUsage(): ApiUsage {
  const usage = getApiUsage();
  
  if (usage.count >= API_LIMIT_PER_HOUR) {
    throw new Error(`Global API limit reached. ${API_LIMIT_PER_HOUR} requests per hour across all users. Resets in ${Math.ceil((usage.resetTime - Date.now()) / (60 * 1000))} minutes.`);
  }

  const newUsage: ApiUsage = {
    count: usage.count + 1,
    resetTime: usage.resetTime,
    lastRequest: Date.now(),
    totalGlobalRequests: usage.totalGlobalRequests + 1
  };

  // Store globally - simulates global counter across all users
  localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(newUsage));
  
  // Broadcast to other tabs/windows to simulate global state
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('globalApiUsageUpdate', { detail: newUsage }));
  }
  
  return newUsage;
}

export function canMakeApiRequest(): boolean {
  const usage = getApiUsage();
  return usage.count < API_LIMIT_PER_HOUR;
}

export function getRemainingRequests(): number {
  const usage = getApiUsage();
  return Math.max(0, API_LIMIT_PER_HOUR - usage.count);
}

export function getTimeUntilReset(): number {
  const usage = getApiUsage();
  return Math.max(0, usage.resetTime - Date.now());
}

export function formatTimeUntilReset(): string {
  const timeLeft = getTimeUntilReset();
  
  if (timeLeft <= 0) return 'Now';
  
  const totalMinutes = Math.floor(timeLeft / (60 * 1000));
  const totalSeconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
  
  if (totalMinutes === 0) {
    return totalSeconds <= 30 ? 'Now' : 'Less than 1 minute';
  }
  
  if (totalMinutes === 1) return '1 minute';
  if (totalMinutes < 60) return `${totalMinutes} minutes`;
  
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  if (hours === 1 && remainingMinutes === 0) return '1 hour';
  if (remainingMinutes === 0) return `${hours} hours`;
  
  return `${hours}h ${remainingMinutes}m`;
}

export function startGlobalSync(): void {
  if (typeof window === 'undefined') return;
  
  // Check for counter reset every minute
  const resetCheckInterval = setInterval(() => {
    const usage = getApiUsage(); // This will auto-reset if needed
    
    // Also simulate random API usage from other users (very rarely)
    if (Math.random() < 0.03) { // 3% chance every minute
      const simulatedUsage: ApiUsage = {
        ...usage,
        count: Math.min(usage.count + Math.floor(Math.random() * 2) + 1, API_LIMIT_PER_HOUR),
        totalGlobalRequests: usage.totalGlobalRequests + Math.floor(Math.random() * 3) + 1
      };
      
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(simulatedUsage));
      console.log('Simulated global API usage from other users');
      
      // Dispatch event to notify UI
      window.dispatchEvent(new CustomEvent('globalApiUsageUpdate', { detail: simulatedUsage }));
    }
  }, 60000); // Check every minute for more accurate reset timing
  
  // Also check every 10 seconds for immediate updates
  const quickCheckInterval = setInterval(() => {
    const usage = getApiUsage();
    // Just trigger a check, getApiUsage will handle reset if needed
  }, 10000);
  
  // Clear intervals when page unloads
  window.addEventListener('beforeunload', () => {
    clearInterval(resetCheckInterval);
    clearInterval(quickCheckInterval);
  });
}

export function getTotalGlobalRequests(): number {
  const usage = getApiUsage();
  return usage.totalGlobalRequests;
}

// Initialize global event listener for cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('globalApiUsageUpdate', (event: any) => {
    const newUsage = event.detail as ApiUsage;
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(newUsage));
  });
  
  window.addEventListener('globalApiCounterReset', (event: any) => {
    const resetUsage = event.detail as ApiUsage;
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(resetUsage));
    console.log('API counter reset for new hour - all users now have fresh 60 requests');
  });
  
  // Also listen for storage changes from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === GLOBAL_STORAGE_KEY && event.newValue) {
      // Storage was updated in another tab - this simulates global counter
      const newUsage = JSON.parse(event.newValue) as ApiUsage;
      
      // Check if this was a reset
      if (newUsage.count === 0 && newUsage.resetTime > Date.now()) {
        console.log('Global API counter reset detected from another tab/user');
      } else {
        console.log('Global API counter updated from another user/tab');
      }
    }
  });
}