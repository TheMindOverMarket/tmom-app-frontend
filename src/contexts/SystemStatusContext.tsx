import { createContext, useCallback, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { registerFetchTracking } from '../utils/apiUtils';

interface SystemStatusContextType {
  isBooting: boolean;
  startTrackedRequest: () => void;
  endTrackedRequest: () => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export function SystemStatusProvider({ children }: { children: ReactNode }) {
  const [isBooting, setIsBooting] = useState(false);
  const activeRequestsRef = useRef(0);
  const bootingTimeoutRef = useRef<any>(null);

  const startTrackedRequest = useCallback(() => {
    activeRequestsRef.current += 1;
    if (activeRequestsRef.current === 1) {
      bootingTimeoutRef.current = setTimeout(() => {
        setIsBooting(true);
      }, 1500);
    }
  }, []);

  const endTrackedRequest = useCallback(() => {
    activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
    if (activeRequestsRef.current === 0) {
      if (bootingTimeoutRef.current) {
        clearTimeout(bootingTimeoutRef.current);
        bootingTimeoutRef.current = null;
      }
      setIsBooting(false);
    }
  }, []);

  // Register tracking methods globally for safeFetch to consume
  useEffect(() => {
    registerFetchTracking({
      startTrackedRequest,
      endTrackedRequest
    });
  }, [startTrackedRequest, endTrackedRequest]);

  return (
    <SystemStatusContext.Provider
      value={{
        isBooting,
        startTrackedRequest,
        endTrackedRequest,
      }}
    >
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
}
