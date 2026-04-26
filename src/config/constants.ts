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

// Standard WebSocket derivation
const getWsUrl = (baseUrl: string, path: string) => {
  if (import.meta.env.DEV) {
    // In local development, we use the Vite proxy to avoid CORS/Origin issues.
    // This points to ws://localhost:5173/api/engine/ws/engine-output
    return `ws://${window.location.host}/api/engine${path}`;
  }
  return `${toWebSocketBaseUrl(baseUrl)}${path}`;
};

const ruleEngineWsUrl = import.meta.env.VITE_RULE_ENGINE_WS_URL || getWsUrl(ruleEngineBaseUrl, '/ws/engine-output');

const deviationEngineBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_DEVIATION_ENGINE_BASE_URL || ruleEngineBaseUrl
);
const deviationEngineWsUrl = import.meta.env.VITE_DEVIATION_ENGINE_WS_URL || getWsUrl(deviationEngineBaseUrl, '/ws/deviation-output');

export const CONFIG = {
  BACKEND_BASE_URL: '/api/backend',
  ENGINE_BASE_URL: '/api/engine',
  WS_ENGINE_URL: ruleEngineWsUrl,
  DEVIATION_ENGINE_BASE_URL: deviationEngineBaseUrl,
  DEVIATION_ENGINE_WS_URL: deviationEngineWsUrl,
};
