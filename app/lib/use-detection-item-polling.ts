import { useState, useEffect, useCallback, useRef } from 'react';

export type DetectionItemStatus = 
  | "DETECTED" 
  | "CONFIRMED" 
  | "CANCELLED" 
  | "IGNORED" 
  | "IN_PROGRESS" 
  | "FOLLOW_UP_REQUIRED" 
  | "COMPLETED";

export interface DetectionItem {
  id: string;
  status: DetectionItemStatus;
  itemName: string;
  subscriptionType: string;
  detectedAmount: number;
  confidence: number;
  cancellationDate?: string;
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface PollingState {
  detectionItem: DetectionItem | null;
  isLoading: boolean;
  error: string | null;
  hasUpdates: boolean;
}

interface UseDetectionItemPollingOptions {
  detectionItemId: string;
  enabled?: boolean;
  pollInterval?: number; // milliseconds, default 2000 (2 seconds)
  maxRetries?: number;
}

export function useDetectionItemPolling({
  detectionItemId,
  enabled = true,
  pollInterval = 2000,
  maxRetries = 5
}: UseDetectionItemPollingOptions): PollingState {
  const [state, setState] = useState<PollingState>({
    detectionItem: null,
    isLoading: false,
    error: null,
    hasUpdates: false
  });

  const lastUpdatedRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const poll = useCallback(async () => {
    if (!enabled || !detectionItemId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        id: detectionItemId,
        ...(lastUpdatedRef.current && { lastUpdated: lastUpdatedRef.current })
      });

      const response = await fetch(`/api/detection-items/status?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown polling error');
      }

      // Update the last updated timestamp with the next poll timestamp
      lastUpdatedRef.current = result.nextPollTimestamp || result.detectionItem.updatedAt;

      setState(prev => ({
        detectionItem: result.detectionItem,
        isLoading: false,
        error: null,
        hasUpdates: result.hasUpdates
      }));

      // Reset retry count on successful poll
      retryCountRef.current = 0;

      // Stop polling if status is final
      const finalStatuses = ["COMPLETED", "FOLLOW_UP_REQUIRED", "CANCELLED", "IGNORED"];
      const isFinalStatus = finalStatuses.includes(result.detectionItem.status);

      // Continue polling if still enabled and not in final status
      if (enabled && !isFinalStatus) {
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      } else if (isFinalStatus) {
        console.log(`🎯 Polling stopped - DetectionItem ${result.detectionItem.id} reached final status: ${result.detectionItem.status}`);
      }

    } catch (error) {
      console.error('DetectionItem polling error:', error);
      
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `Polling failed after ${maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`
        }));
        return;
      }

      // Retry with exponential backoff
      const retryDelay = pollInterval * Math.pow(2, retryCountRef.current - 1);
      pollTimeoutRef.current = setTimeout(poll, retryDelay);
    }
  }, [detectionItemId, enabled, pollInterval, maxRetries]);

  // Start polling when enabled or detectionItemId changes
  useEffect(() => {
    if (enabled && detectionItemId) {
      // Clear any existing timeout
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      
      // Start immediate poll
      poll();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [enabled, detectionItemId, poll]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (enabled && detectionItemId) {
      lastUpdatedRef.current = null; // Force full refresh
      poll();
    }
  }, [enabled, detectionItemId, poll]);

  // Return state with refresh function
  return {
    ...state,
    refresh
  } as PollingState & { refresh: () => void };
}

// Helper function to get status display text
export function getStatusDisplayText(status: DetectionItemStatus): string {
  const statusMap: Record<DetectionItemStatus, string> = {
    "DETECTED": "Detected",
    "CONFIRMED": "Confirmed", 
    "CANCELLED": "Cancelled",
    "IGNORED": "Ignored",
    "IN_PROGRESS": "In Progress",
    "FOLLOW_UP_REQUIRED": "Follow-up Required",
    "COMPLETED": "Completed"
  };
  
  return statusMap[status] || status;
}

// Helper function to get status color
export function getStatusColor(status: DetectionItemStatus): string {
  const colorMap: Record<DetectionItemStatus, string> = {
    "DETECTED": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "CONFIRMED": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "CANCELLED": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    "IGNORED": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    "IN_PROGRESS": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "FOLLOW_UP_REQUIRED": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "COMPLETED": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  };
  
  return colorMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
}
