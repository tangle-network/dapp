export const isValidSubqueryEndpoint = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{__schema{types{name}}}' }),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const isValidPolkadotEndpoint = async (endpoint: string) => {
  const endpointRegex =
    /^wss?:\/\/(?:(?:\d{1,3}\.){3}\d{1,3}|localhost|\[[0-9a-fA-F:]+\]|(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+\.[a-zA-Z]{2,6})(?::\d{1,5})?$/;

  return endpointRegex.test(endpoint);
};
