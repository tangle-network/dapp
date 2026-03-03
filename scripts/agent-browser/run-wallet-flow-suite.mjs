#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const DEFAULT_CASES_PATH =
  'scripts/agent-browser/cases/launch-ready-manual-signoff.cases.mjs';
const DEFAULT_CONFIG_PATH = 'agent-browser-driver.config.mjs';
const LAUNCH_BOARD_PATH = 'docs/launch-readiness-board.csv';

const log = (message) => console.log(`[wallet-flows] ${message}`);

const safeNumber = (value, label) => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive number. Received: ${value}`);
  }

  return parsed;
};

const getReadyManualSignoffFlowIds = (csvPath) => {
  const raw = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = raw.split(/\r?\n/).slice(1);

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.slice(line.lastIndexOf(',') + 1).trim() === 'ready-manual-signoff')
    .map((line) => line.slice(0, line.indexOf(',')));
};

const validateCaseCoverage = (cases) => {
  const boardPath = path.resolve(LAUNCH_BOARD_PATH);
  if (!fs.existsSync(boardPath)) {
    throw new Error(`Launch board not found: ${boardPath}`);
  }

  const expectedIds = getReadyManualSignoffFlowIds(boardPath);
  const caseIds = new Set(cases.map((testCase) => testCase.id));

  const missing = expectedIds.filter((flowId) => !caseIds.has(flowId));
  if (missing.length > 0) {
    throw new Error(
      `Case catalog is missing ready-manual-signoff flows: ${missing.join(', ')}`,
    );
  }

  const extras = [...caseIds].filter((flowId) => !expectedIds.includes(flowId));
  if (extras.length > 0) {
    log(`Detected extra cases beyond launch board: ${extras.join(', ')}`);
  }
};

const loadAgentDriverModule = async () => {
  const candidates = [];
  if (process.env.AGENT_BROWSER_DRIVER_MODULE) {
    candidates.push(process.env.AGENT_BROWSER_DRIVER_MODULE);
  }

  candidates.push('@tangle-network/agent-browser-driver');
  candidates.push(
    pathToFileURL(
      path.resolve(process.cwd(), '../agent-browser-driver/dist/index.js'),
    ).href,
  );

  const errors = [];

  for (const candidate of candidates) {
    try {
      const module = await import(candidate);
      log(`Loaded agent-browser-driver module from ${candidate}`);
      return module;
    } catch (error) {
      errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(
    [
      'Unable to load @tangle-network/agent-browser-driver.',
      'Tried module locations:',
      ...errors.map((entry) => `- ${entry}`),
      'Set AGENT_BROWSER_DRIVER_MODULE to an explicit module path if needed.',
    ].join('\n'),
  );
};

const loadPlaywright = async () => {
  try {
    return await import('playwright');
  } catch (error) {
    throw new Error(
      [
        'The playwright package is required to run wallet flow suites.',
        'Install it in this repo or ensure it is available via workspace dependencies.',
        `Original error: ${error instanceof Error ? error.message : String(error)}`,
      ].join('\n'),
    );
  }
};

const loadCases = async (casesPath, caseContext) => {
  const resolvedPath = path.resolve(casesPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Cases file not found: ${resolvedPath}`);
  }

  if (resolvedPath.endsWith('.json')) {
    const raw = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    if (!Array.isArray(raw)) {
      throw new Error(`Cases JSON must contain an array: ${resolvedPath}`);
    }

    return raw;
  }

  const module = await import(pathToFileURL(resolvedPath).href);
  const factory =
    module.createLaunchReadyManualSignoffCases ??
    module.default ??
    module.cases;

  if (typeof factory === 'function') {
    const result = await factory(caseContext);
    if (!Array.isArray(result)) {
      throw new Error(
        `Cases factory must return an array. File: ${resolvedPath}`,
      );
    }

    return result;
  }

  if (!Array.isArray(factory)) {
    throw new Error(
      `Cases module must export an array or a factory function. File: ${resolvedPath}`,
    );
  }

  return factory;
};

const filterCases = (cases, filters) => {
  const flowFilter = new Set(filters.flowIds);
  const personaFilter = new Set(filters.personas.map((entry) => entry.toLowerCase()));
  const tagFilter = new Set(filters.tags);

  return cases.filter((testCase) => {
    if (flowFilter.size > 0 && !flowFilter.has(testCase.id)) {
      return false;
    }

    if (
      personaFilter.size > 0 &&
      !personaFilter.has(String(testCase.category ?? '').toLowerCase())
    ) {
      return false;
    }

    if (tagFilter.size > 0) {
      const caseTags = new Set(testCase.tags ?? []);
      for (const tag of tagFilter) {
        if (!caseTags.has(tag)) {
          return false;
        }
      }
    }

    return true;
  });
};

const printCaseList = (cases) => {
  log(`Selected ${cases.length} cases:`);
  for (const testCase of cases) {
    const tagString = (testCase.tags ?? []).join(', ');
    console.log(
      `- ${testCase.id} [${testCase.category ?? 'uncategorized'}] ${testCase.name} :: ${testCase.startUrl}${
        tagString ? ` :: tags=${tagString}` : ''
      }`,
    );
  }
};

const options = parseArgs({
  options: {
    cases: { type: 'string' },
    config: { type: 'string' },
    provider: { type: 'string' },
    model: { type: 'string' },
    'api-key': { type: 'string' },
    'base-url': { type: 'string' },
    'dapp-base-url': { type: 'string' },
    'cloud-base-url': { type: 'string' },
    'blueprint-id': { type: 'string' },
    'service-id': { type: 'string' },
    flow: { type: 'string', multiple: true },
    persona: { type: 'string', multiple: true },
    tag: { type: 'string', multiple: true },
    'wallet-extension': { type: 'string', multiple: true },
    'wallet-user-data-dir': { type: 'string' },
    'max-turns': { type: 'string' },
    'timeout-ms': { type: 'string' },
    'output-dir': { type: 'string' },
    list: { type: 'boolean' },
    debug: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
  allowPositionals: false,
}).values;

if (options.help) {
  console.log(`\
Usage:
  node scripts/agent-browser/run-wallet-flow-suite.mjs [options]

Options:
  --cases <path>                  Cases module/JSON file (default: ${DEFAULT_CASES_PATH})
  --config <path>                 agent-browser-driver config file (default: ${DEFAULT_CONFIG_PATH})
  --provider <name>               LLM provider override (openai/anthropic/google)
  --model <name>                  LLM model override
  --api-key <value>               LLM API key override
  --base-url <url>                LLM base URL override (LiteLLM/local proxy/etc.)
  --dapp-base-url <url>           dApp base URL (default: http://localhost:4200)
  --cloud-base-url <url>          cloud base URL (default: http://localhost:4300)
  --blueprint-id <id>             Blueprint ID for flows requiring /blueprints/:id paths
  --service-id <id>               Service ID for flows requiring /services/:id paths
  --flow <FLOW-XXX>               Filter to one or more flow IDs
  --persona <persona>             Filter to persona(s): user/customer/operator/developer
  --tag <tag>                     Filter by required case tag (repeatable)
  --wallet-extension <path>       Wallet extension path (repeatable)
  --wallet-user-data-dir <path>   Persistent browser profile path
  --max-turns <n>                 Override max turns per case
  --timeout-ms <n>                Override timeout per case in milliseconds
  --output-dir <path>             Artifact/report output directory
  --list                          Print selected cases and exit
  --debug                         Enable debug logging in runner config
  -h, --help                      Show this help
`);
  process.exit(0);
}

const main = async () => {
  const casesPath = options.cases ?? DEFAULT_CASES_PATH;
  const configPath = options.config ?? DEFAULT_CONFIG_PATH;

  const dappBaseUrl = options['dapp-base-url'] ?? 'http://localhost:4200';
  const cloudBaseUrl = options['cloud-base-url'] ?? 'http://localhost:4300';

  const maxTurnsOverride = safeNumber(options['max-turns'], '--max-turns');
  const timeoutOverride = safeNumber(options['timeout-ms'], '--timeout-ms');
  const runtimeOverrides = {};
  if (maxTurnsOverride !== undefined) {
    runtimeOverrides.maxTurns = maxTurnsOverride;
  }
  if (timeoutOverride !== undefined) {
    runtimeOverrides.timeoutMs = timeoutOverride;
  }
  if (options['output-dir']) {
    runtimeOverrides.outputDir = options['output-dir'];
  }
  if (options.provider) {
    runtimeOverrides.provider = options.provider;
  }
  if (options.model) {
    runtimeOverrides.model = options.model;
  }
  if (options['api-key']) {
    runtimeOverrides.apiKey = options['api-key'];
  }
  if (options['base-url']) {
    runtimeOverrides.baseUrl = options['base-url'];
  }
  const walletExtensions = options['wallet-extension'] ?? [];
  const walletUserDataDir = options['wallet-user-data-dir'];
  if (walletExtensions.length > 0 || walletUserDataDir) {
    runtimeOverrides.wallet = {
      ...(walletExtensions.length > 0
        ? { extensionPaths: walletExtensions }
        : {}),
      ...(walletUserDataDir ? { userDataDir: walletUserDataDir } : {}),
    };
  }

  const allCases = await loadCases(casesPath, {
    dappBaseUrl,
    cloudBaseUrl,
    blueprintId: options['blueprint-id'],
    serviceId: options['service-id'],
  });

  validateCaseCoverage(allCases);

  const selectedCases = filterCases(allCases, {
    flowIds: options.flow ?? [],
    personas: options.persona ?? [],
    tags: options.tag ?? [],
  });

  if (selectedCases.length === 0) {
    throw new Error(
      'No cases selected after applying filters. Remove filters or provide valid flow/persona/tag values.',
    );
  }

  printCaseList(selectedCases);

  if (options.list) {
    return;
  }

  const applyCaseRuntimeOverrides = (testCase) => {
    const next = { ...testCase };
    if (maxTurnsOverride !== undefined) {
      next.maxTurns = maxTurnsOverride;
    } else if (next.maxTurns === undefined && mergedConfig.maxTurns !== undefined) {
      next.maxTurns = mergedConfig.maxTurns;
    }

    if (timeoutOverride !== undefined) {
      next.timeoutMs = timeoutOverride;
    } else if (next.timeoutMs === undefined && mergedConfig.timeoutMs !== undefined) {
      next.timeoutMs = mergedConfig.timeoutMs;
    }

    return next;
  };

  const driverModule = await loadAgentDriverModule();
  const playwrightModule = await loadPlaywright();

  const {
    loadConfig,
    mergeConfig,
    toAgentConfig,
    buildBrowserLaunchPlan,
    TestRunner,
    PlaywrightDriver,
    FilesystemSink,
  } = driverModule;

  const { chromium } = playwrightModule;

  const fileConfig = await loadConfig(configPath);
  const mergedConfig = mergeConfig(fileConfig, runtimeOverrides);
  const launchPlan = buildBrowserLaunchPlan(mergedConfig, {
    cwd: process.cwd(),
  });

  const outputDir = path.resolve(
    mergedConfig.outputDir ?? './agent-results/wallet-flows',
  );
  fs.mkdirSync(outputDir, { recursive: true });

  log(`Output directory: ${outputDir}`);
  log(
    `Launch mode: wallet=${launchPlan.walletMode} headless=${launchPlan.headless} concurrency=${launchPlan.concurrency}`,
  );
  for (const warning of launchPlan.warnings ?? []) {
    log(`warning: ${warning}`);
  }
  if ((launchPlan.errors ?? []).length > 0) {
    throw new Error(
      `Browser launch preflight failed:\n- ${launchPlan.errors.join('\n- ')}`,
    );
  }

  let browser;
  let persistentContext;

  const createDriver = async () => {
    const context = persistentContext
      ? persistentContext
      : await browser.newContext({
          viewport: launchPlan.viewport,
          ignoreHTTPSErrors: true,
        });

    const page = await context.newPage();
    const driver = new PlaywrightDriver(page, {
      captureScreenshots: Boolean(mergedConfig.vision),
    });

    return {
      observe: () => driver.observe(),
      execute: (action) => driver.execute(action),
      getPage: () => driver.getPage?.(),
      screenshot: () => driver.screenshot(),
      close: async () => {
        await page.close().catch(() => {});
        if (!persistentContext) {
          await context.close().catch(() => {});
        }
      },
    };
  };

  try {
    if (launchPlan.walletMode) {
      const userDataDir =
        launchPlan.userDataDir ?? path.resolve('.agent-wallet-profile');
      fs.mkdirSync(userDataDir, { recursive: true });

      persistentContext = await chromium.launchPersistentContext(userDataDir, {
        channel: 'chromium',
        headless: launchPlan.headless,
        args: launchPlan.browserArgs,
        viewport: launchPlan.viewport,
        ignoreHTTPSErrors: true,
      });

      log(`Wallet mode persistent context: ${userDataDir}`);
    } else {
      browser = await chromium.launch({
        headless: launchPlan.headless,
        args: launchPlan.browserArgs,
      });
    }

    const singletonDriver =
      launchPlan.concurrency <= 1 ? await createDriver() : undefined;

    const apiKey =
      mergedConfig.apiKey ??
      process.env.OPENAI_API_KEY ??
      process.env.ANTHROPIC_API_KEY ??
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey && !mergedConfig.baseUrl) {
      throw new Error(
        'Missing LLM API key. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or configure apiKey in agent-browser-driver config.',
      );
    }
    if (!apiKey && mergedConfig.baseUrl) {
      log(
        'warning: no API key provided; continuing because base-url is configured (use --api-key if your proxy requires auth).',
      );
    }

    const testRunner = new TestRunner({
      config: {
        ...toAgentConfig(mergedConfig),
        apiKey: apiKey ?? 'local-dev-key',
        debug: Boolean(options.debug),
      },
      defaultTimeoutMs: mergedConfig.timeoutMs,
      driver: singletonDriver,
      driverFactory: launchPlan.concurrency > 1 ? createDriver : undefined,
      concurrency: launchPlan.concurrency,
      screenshotInterval: mergedConfig.screenshotInterval,
      artifactSink: new FilesystemSink(outputDir),
      onTestStart: (testCase) => log(`start ${testCase.id} ${testCase.name}`),
      onTestComplete: (result) => {
        const strictPass = Boolean(result.agentSuccess && result.verified);
        log(
          `${strictPass ? 'pass' : 'fail'} ${result.testCase.id} verdict=${result.verdict} durationMs=${result.durationMs}`,
        );
      },
    });

    const suite = await testRunner.runSuite(
      selectedCases.map((testCase) => applyCaseRuntimeOverrides(testCase)),
    );

    const strictPassed = suite.results.filter(
      (result) => result.agentSuccess && result.verified,
    ).length;
    const strictFailed = suite.results.length - strictPassed;
    log(
      `Suite complete: passed=${strictPassed} failed=${strictFailed} skipped=${suite.summary.skipped}`,
    );

    if (strictFailed > 0 || suite.summary.skipped > 0) {
      process.exitCode = 1;
    }

    await singletonDriver?.close?.();
  } finally {
    await persistentContext?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};

main().catch((error) => {
  console.error(
    `[wallet-flows] fatal: ${error instanceof Error ? error.stack ?? error.message : String(error)}`,
  );
  process.exit(1);
});
