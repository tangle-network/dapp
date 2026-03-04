const parseList = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

export default {
  provider: process.env.AGENT_BROWSER_PROVIDER ?? 'openai',
  model: process.env.AGENT_BROWSER_MODEL ?? 'gpt-4o',
  outputDir: process.env.AGENT_BROWSER_OUTPUT_DIR ?? './agent-results/wallet-flows',
  maxTurns: Number(process.env.AGENT_BROWSER_MAX_TURNS ?? 60),
  timeoutMs: Number(process.env.AGENT_BROWSER_TIMEOUT_MS ?? 900_000),
  vision: true,
  goalVerification: true,
  screenshotInterval: 2,
  concurrency: 1,
  headless: parseBoolean(process.env.AGENT_BROWSER_HEADLESS, true),
  wallet: {
    enabled: true,
    extensionPaths: parseList(process.env.AGENT_WALLET_EXTENSION_PATHS),
    userDataDir:
      process.env.AGENT_WALLET_USER_DATA_DIR ?? './.agent-wallet-profile',
  },
};
