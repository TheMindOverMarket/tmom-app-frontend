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
const ruleEngineWsUrl = normalizeBaseUrl(
  import.meta.env.VITE_RULE_ENGINE_WS_URL ??
    (ruleEngineBaseUrl
      ? `${toWebSocketBaseUrl(ruleEngineBaseUrl)}/ws/engine-output`
      : ''),
);

const deviationEngineBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_DEVIATION_ENGINE_BASE_URL || ruleEngineBaseUrl
);
const deviationEngineWsUrl = normalizeBaseUrl(
  import.meta.env.VITE_DEVIATION_ENGINE_WS_URL ??
    (deviationEngineBaseUrl
      ? `${toWebSocketBaseUrl(deviationEngineBaseUrl)}/ws/deviation-output`
      : ''),
);

export const CONFIG = {
  BACKEND_BASE_URL: '/api/backend',
  ENGINE_BASE_URL: '/api/engine',
  WS_ENGINE_URL: ruleEngineWsUrl,
  DEVIATION_ENGINE_BASE_URL: deviationEngineBaseUrl,
  DEVIATION_ENGINE_WS_URL: deviationEngineWsUrl,
};
