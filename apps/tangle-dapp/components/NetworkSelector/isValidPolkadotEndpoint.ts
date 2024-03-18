const isValidPolkadotEndpoint = async (endpoint: string) => {
  // TODO: Need to break down this regex into code or at least comment it.
  const endpointRegex =
    /^wss?:\/\/(?:(?:\d{1,3}\.){3}\d{1,3}|localhost|\[[0-9a-fA-F:]+\]|(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+\.[a-zA-Z]{2,6})(?::\d{1,5})?$/;

  return endpointRegex.test(endpoint);
};

export default isValidPolkadotEndpoint;
