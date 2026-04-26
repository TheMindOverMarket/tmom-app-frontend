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

const ruleEngineBaseUrl = 'https://rule-engine-rcg9.onrender.com';
const ruleEngineWsUrl = 'wss://rule-engine-rcg9.onrender.com/ws/engine-output';
const deviationEngineBaseUrl = 'https://rule-engine-rcg9.onrender.com'; // Using converged engine
const deviationEngineWsUrl = 'wss://rule-engine-rcg9.onrender.com/ws/deviation-output';

export const CONFIG = {
  BACKEND_BASE_URL: '/api/backend',
  ENGINE_BASE_URL: '/api/engine',
  WS_ENGINE_URL: ruleEngineWsUrl,
  DEVIATION_ENGINE_BASE_URL: deviationEngineBaseUrl,
  DEVIATION_ENGINE_WS_URL: deviationEngineWsUrl,
};
