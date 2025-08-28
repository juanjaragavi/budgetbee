/**
 * React Hook for AdZep Activation
 * Provides a hook-based approach for components that need to interact with AdZep
 */

import { useEffect, useState, useCallback } from "react";
import {
  activateAdZep,
  getAdZepState,
  isAdZepActivated,
  resetAdZepState,
} from "../lib/adZepUtils";

export interface UseAdZepReturn {
  isActivated: boolean;
  isActivating: boolean;
  activationAttempts: number;
  lastActivation: Date | null;
  activate: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook for managing AdZep activation state and providing activation controls
 * @param autoActivate Whether to automatically activate on mount (default: true)
 * @param activationDelay Delay before auto-activation in milliseconds (default: 100)
 */
export function useAdZep(
  autoActivate: boolean = true,
  activationDelay: number = 100,
): UseAdZepReturn {
  const [isActivated, setIsActivated] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationAttempts, setActivationAttempts] = useState(0);
  const [lastActivation, setLastActivation] = useState<Date | null>(null);

  // Update state from global AdZep state
  const updateState = useCallback(() => {
    const state = getAdZepState();
    if (state) {
      setIsActivated(state.activated);
      setIsActivating(state.activationInProgress);
      setActivationAttempts(state.activationAttempts);
      setLastActivation(
        state.lastActivation ? new Date(state.lastActivation) : null,
      );
    }
  }, []);

  // Manual activation function
  const activate = useCallback(async (): Promise<boolean> => {
    setIsActivating(true);

    try {
      const success = await activateAdZep({
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 500,
      });

      updateState();
      return success;
    } catch (error) {
      console.error("[useAdZep] Error during manual activation:", error);
      return false;
    } finally {
      setIsActivating(false);
    }
  }, [updateState]);

  // Reset function
  const reset = useCallback(() => {
    resetAdZepState();
    updateState();
  }, [updateState]);

  // Auto-activation effect
  useEffect(() => {
    if (!autoActivate) {
      updateState();
      return;
    }

    // Check if already activated
    if (isAdZepActivated()) {
      updateState();
      return;
    }

    // Auto-activate after delay
    const timeoutId = setTimeout(() => {
      activate();
    }, activationDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoActivate, activationDelay, activate, updateState]);

  // Periodic state sync
  useEffect(() => {
    const intervalId = setInterval(updateState, 1000);
    return () => clearInterval(intervalId);
  }, [updateState]);

  return {
    isActivated,
    isActivating,
    activationAttempts,
    lastActivation,
    activate,
    reset,
  };
}
