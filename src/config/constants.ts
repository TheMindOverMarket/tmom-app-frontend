const normalizeBaseUrl = (value?: string) => value?.replace(/\/$/, '') ?? '';

const toWebSocketBaseUrl = (value: string) => {
  if (value.startsWith('https://')) {
    return `wss://${value.slice('https://'.length)}`;
  }

  if (value.startsWith('http://')) {
    return `ws://${value.slice('http://'.length)}`;
  }

  return value;
};

const ruleEngineBaseUrl = normalizeBaseUrl(import.meta.env.VITE_RULE_ENGINE_BASE_URL);
const backendBaseUrl = normalizeBaseUrl(import.meta.env.VITE_BACKEND_BASE_URL || '/api/backend');

// Standard WebSocket derivation
const getWsUrl = (baseUrl: string, path: string, localPrefix: string) => {
  if (import.meta.env.DEV) {
    // In local development, we use the Vite proxy to avoid CORS/Origin issues.
    return `ws://${window.location.host}${localPrefix}${path}`;
  }
  
  // If the baseUrl is relative (like '/api/backend' in Vercel), construct an absolute WS URL
  if (baseUrl.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${baseUrl}${path}`;
  }
  
  return `${toWebSocketBaseUrl(baseUrl)}${path}`;
};

const ruleEngineWsUrl = import.meta.env.VITE_RULE_ENGINE_WS_URL || getWsUrl(ruleEngineBaseUrl, '/ws/engine-output', '/api/engine');

const deviationEngineBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_DEVIATION_ENGINE_BASE_URL || ruleEngineBaseUrl
);
const deviationEngineWsUrl = import.meta.env.VITE_DEVIATION_ENGINE_WS_URL || getWsUrl(deviationEngineBaseUrl, '/ws/deviation-output', '/api/engine');

const backendWsUrl = import.meta.env.VITE_BACKEND_WS_URL || getWsUrl(backendBaseUrl, '/ws/market-state', '/api/backend');

export const CONFIG = {
  BACKEND_BASE_URL: backendBaseUrl,
  ENGINE_BASE_URL: '/api/engine',
  WS_ENGINE_URL: ruleEngineWsUrl,
  DEVIATION_ENGINE_BASE_URL: deviationEngineBaseUrl,
  DEVIATION_ENGINE_WS_URL: deviationEngineWsUrl,
  WS_BACKEND_URL: backendWsUrl,
};
