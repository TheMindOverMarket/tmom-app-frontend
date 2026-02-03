export const ingestRule = async (ruleNl: string): Promise<void> => {
  const response = await fetch('/api/backend/rule/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rule_nl: ruleNl }),
  });

  if (!response.ok) {
    throw new Error(`Failed to ingest rule: ${response.statusText}`);
  }
};
