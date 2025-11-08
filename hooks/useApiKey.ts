import { useState, useEffect, useCallback } from 'react';

// This is a simplified representation of the window.aistudio object.
// In a real environment, this would be provided by the host.
declare global {
  // Fix: Moved the AIStudio interface into the global declaration to resolve a module scope type conflict.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkApiKey = useCallback(async () => {
    if (!window.aistudio) {
      console.warn("aistudio object not found. Running in a development environment.");
      setHasApiKey(true); // Assume key exists in dev
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    try {
      const result = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(result);
    } catch (error) {
      console.error("Error checking for API key:", error);
      setHasApiKey(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const selectApiKey = useCallback(async () => {
    if (!window.aistudio) {
      alert("API key selection is not available in this environment.");
      return;
    }
    try {
      await window.aistudio.openSelectKey();
      // Assume success and optimistically update the state.
      // This helps mitigate race conditions where hasSelectedApiKey is not immediately true.
      setHasApiKey(true);
    } catch (error) {
      console.error("Error opening API key selection:", error);
    }
  }, []);
  
  const resetApiKey = useCallback(() => {
     setHasApiKey(false);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  return { hasApiKey, isChecking, selectApiKey, checkApiKey, resetApiKey };
};
