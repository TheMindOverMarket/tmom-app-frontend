import { CONFIG } from '../config/constants';

interface FetchTracking {
  startTrackedRequest: () => void;
  endTrackedRequest: () => void;
}

let tracking: FetchTracking | null = null;

/**
 * Registry for SystemStatus internal tracking.
 * This should be called once by the SystemStatusProvider to hook into safeFetch.
 */
export const registerFetchTracking = (newTracking: FetchTracking) => {
  tracking = newTracking;
};

/**
 * A wrapper around the browser's native fetch that:
 * 1. Automatically includes 'credentials: include' for backend requests.
 * 2. Notifies the SystemStatus tracking if a request takes too long.
 */
export const safeFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  const isBackendRequest = 
    url.includes(CONFIG.BACKEND_BASE_URL) || 
    url.includes(CONFIG.ENGINE_BASE_URL);

  // Auto-apply credentials for backend requests
  const modifiedInit: RequestInit = {
    ...init,
    credentials: isBackendRequest ? 'include' : init?.credentials,
  };

  // Start tracking
  tracking?.startTrackedRequest();

  try {
    const response = await fetch(input, modifiedInit);
    return response;
  } finally {
    // End tracking
    tracking?.endTrackedRequest();
  }
};
