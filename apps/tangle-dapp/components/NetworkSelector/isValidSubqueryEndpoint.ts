const isValidSubqueryEndpoint = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ query: '{__schema{types{name}}}' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Any 2xx status code is considered valid.
    return response.ok;
  } catch {
    // Assume that the endpoint is invalid if the fetch fails.
    return false;
  }
};

export default isValidSubqueryEndpoint;
