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
const DEFAULT_WALLET_PASSWORD =
  process.env.AGENT_WALLET_PASSWORD ?? 'TangleLocal123!';
const DEFAULT_WALLET_CHAIN_ID = Number(
  process.env.AGENT_WALLET_CHAIN_ID ?? '31337',
);
const DEFAULT_WALLET_CHAIN_HEX =
  process.env.AGENT_WALLET_CHAIN_HEX ??
  `0x${DEFAULT_WALLET_CHAIN_ID.toString(16)}`;
const DEFAULT_WALLET_CHAIN_RPC_URL =
  process.env.AGENT_WALLET_RPC_URL ?? 'http://127.0.0.1:8545';
const DEFAULT_WALLET_CHAIN_NAME =
  process.env.AGENT_WALLET_CHAIN_NAME ?? 'Tangle Local';
const DEFAULT_WALLET_NATIVE_NAME =
  process.env.AGENT_WALLET_NATIVE_NAME ?? 'Ether';
const DEFAULT_WALLET_NATIVE_SYMBOL =
  process.env.AGENT_WALLET_NATIVE_SYMBOL ?? 'ETH';
const DEFAULT_WALLET_NATIVE_DECIMALS = 18;
let runtimeWalletChain = {
  id: DEFAULT_WALLET_CHAIN_ID,
  hex: DEFAULT_WALLET_CHAIN_HEX.toLowerCase(),
  rpcUrl: DEFAULT_WALLET_CHAIN_RPC_URL,
  name: DEFAULT_WALLET_CHAIN_NAME,
  nativeCurrency: {
    name: DEFAULT_WALLET_NATIVE_NAME,
    symbol: DEFAULT_WALLET_NATIVE_SYMBOL,
    decimals: DEFAULT_WALLET_NATIVE_DECIMALS,
  },
};
const DEFAULT_LOCAL_FUNDER_ADDRESS =
  process.env.AGENT_LOCAL_FUNDING_ADDRESS ??
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const MIN_LOCAL_BALANCE_WEI = 1_000_000_000_000_000_000n; // 1 ETH
const TARGET_LOCAL_BALANCE_WEI = 20_000_000_000_000_000_000n; // 20 ETH
const isLoopbackRpcUrl = (rpcUrl) => {
  try {
    const parsed = new URL(rpcUrl);
    return ['127.0.0.1', 'localhost', '0.0.0.0'].includes(parsed.hostname);
  } catch {
    return false;
  }
};
const CONNECT_BUTTON_SELECTORS = [
  '[data-testid="evm-connect-trigger"]',
  'button:text-matches("^\\s*Connect Wallet\\s*$", "i")',
  '[role="button"]:text-matches("^\\s*Connect Wallet\\s*$", "i")',
  'button:text-matches("^\\s*Connect EVM Wallet\\s*$", "i")',
  '[role="button"]:text-matches("^\\s*Connect EVM Wallet\\s*$", "i")',
  'button:text-matches("^\\s*Connect\\s*$", "i")',
  '[role="button"]:text-matches("^\\s*Connect\\s*$", "i")',
];
const WALLET_OPTION_SELECTORS = [
  '[data-testid^="evm-wallet-option-"]',
  'button[data-wallet-name*="MetaMask" i]',
  '[role="button"][data-wallet-name*="MetaMask" i]',
  'button:text-matches("meta\\s*mask", "i")',
  '[role="button"]:text-matches("meta\\s*mask", "i")',
  'button:has-text("MetaMask")',
  '[role="button"]:has-text("MetaMask")',
  'button:text-matches("injected", "i")',
  '[role="button"]:text-matches("injected", "i")',
  'button:has-text("Browser Wallet")',
  '[role="button"]:has-text("Browser Wallet")',
  'button:has-text("Injected")',
  '[role="button"]:has-text("Injected")',
  'button:has-text("Ethereum Wallet")',
  '[role="button"]:has-text("Ethereum Wallet")',
];

const WALLET_ACTION_SELECTORS = [
  '[data-testid="unlock-submit"]',
  '[data-testid="page-container-footer-next"]',
  '[data-testid="page-container-footer-confirm"]',
  '[data-testid="confirmation-submit-button"]',
  '[data-testid="confirm-button"]',
  '[data-testid="confirm-btn"]',
  '[data-testid="confirm-footer-button"]',
  '[data-testid="onboarding-complete-done"]',
  '[data-testid="pin-extension-next"]',
  '[data-testid="pin-extension-done"]',
  '[role="button"]:has-text("Connect")',
  '[data-testid="request-signature__sign"]',
  '[data-testid="request-signature__sign-button"]',
  'button:has-text("Connect")',
  '[role="button"]:has-text("Approve")',
  'button:has-text("Approve")',
  '[role="button"]:has-text("Confirm")',
  'button:has-text("Confirm")',
  '[role="button"]:has-text("Sign")',
  'button:has-text("Sign")',
  '[role="button"]:has-text("Switch network")',
  '[role="button"]:has-text("Switch Network")',
  'button:has-text("Switch network")',
  'button:has-text("Switch Network")',
  '[role="button"]:has-text("Add network")',
  '[role="button"]:has-text("Add Network")',
  'button:has-text("Add network")',
  'button:has-text("Add Network")',
  '[role="button"]:has-text("Open wallet")',
  'button:has-text("Open wallet")',
  '[role="button"]:has-text("Done")',
  'button:has-text("Done")',
  '[role="button"]:has-text("Got it")',
  'button:has-text("Got it")',
  '[role="button"]:has-text("Next")',
  'button:has-text("Next")',
  '[role="button"]:has-text("No thanks")',
  '[role="button"]:has-text("No Thanks")',
  'button:has-text("No thanks")',
  'button:has-text("No Thanks")',
];

const fillWalletUnlockIfNeeded = async (page, password) => {
  const unlockField = page
    .locator('[data-testid="unlock-password"], input[type="password"]')
    .first();
  const visible = await unlockField
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!visible) {
    return false;
  }

  await unlockField.fill(password, { timeout: 1500 }).catch(() => {});
  return true;
};

const clickFirstEnabled = async (page, selectors) => {
  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      const visible = await candidate
        .isVisible({ timeout: 250 })
        .catch(() => false);
      if (!visible) {
        continue;
      }

      const enabled = await candidate.isEnabled().catch(() => false);
      if (!enabled) {
        continue;
      }

      const clicked = await candidate
        .click({ timeout: 1500 })
        .then(() => true)
        .catch(() => false);
      if (clicked) {
        return true;
      }
    }
  }

  return false;
};

const anySelectorVisible = async (page, selectors, timeoutMs = 1500) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const locator = page.locator(selector);
      const count = await locator.count().catch(() => 0);
      for (let index = 0; index < count; index += 1) {
        const visible = await locator
          .nth(index)
          .isVisible({ timeout: 250 })
          .catch(() => false);
        if (visible) {
          return true;
        }
      }
    }
    await page.waitForTimeout(150).catch(() => {});
  }

  return false;
};

const resolveWalletExtensionId = async (context) => {
  try {
    const workers = context.serviceWorkers();
    if (workers.length > 0) {
      return new URL(workers[0].url()).host;
    }
  } catch {
    // Ignore and fall back to event wait.
  }

  try {
    const worker = await context.waitForEvent('serviceworker', {
      timeout: 5000,
    });
    return new URL(worker.url()).host;
  } catch {
    return undefined;
  }
};

const startWalletAutoApprover = async (context, password) => {
  let active = true;
  const extensionId = await resolveWalletExtensionId(context);
  if (extensionId) {
    log(`Wallet auto-approver targeting extension id ${extensionId}`);
  } else {
    log(
      'Wallet auto-approver did not detect extension id; scanning all extension pages',
    );
  }

  const tick = async () => {
    if (!active) {
      return;
    }

    const pages = context.pages();
    for (const page of pages) {
      if (page.isClosed()) {
        continue;
      }

      const url = page.url();
      if (!url.startsWith('chrome-extension://')) {
        continue;
      }
      if (extensionId && !url.includes(extensionId)) {
        continue;
      }

      await fillWalletUnlockIfNeeded(page, password);
      await clickFirstEnabled(page, WALLET_ACTION_SELECTORS);
    }
  };

  const interval = setInterval(() => {
    tick().catch(() => {});
  }, 750);

  context.on('page', (page) => {
    page.once('domcontentloaded', () => {
      tick().catch(() => {});
    });
  });

  await tick();

  return () => {
    active = false;
    clearInterval(interval);
  };
};

const settlePendingWalletRequests = async (context, password) => {
  const extensionId = await resolveWalletExtensionId(context);
  if (!extensionId) {
    return false;
  }
  const extensionPages = context
    .pages()
    .map((page) => page.url())
    .filter((url) => url.startsWith(`chrome-extension://${extensionId}/`));
  if (extensionPages.length > 0) {
    log(
      `Wallet extension pages while settling pending requests: ${extensionPages.join(', ')}`,
    );
  } else {
    log('Wallet extension pages while settling pending requests: none');
  }

  const logExtensionButtons = async (page, label) => {
    const preview = await page
      .evaluate(() =>
        [...document.querySelectorAll('button')]
          .slice(0, 14)
          .map((button) => ({
            text: (button.textContent ?? '').trim().replace(/\s+/g, ' '),
            disabled: button.disabled,
          }))
          .filter((entry) => entry.text.length > 0),
      )
      .catch(() => []);

    const formatted = Array.isArray(preview)
      ? preview
          .map(
            (entry) =>
              `[${entry.disabled ? 'disabled' : 'enabled'}] ${entry.text}`,
          )
          .join(' | ')
      : '';
    if (formatted) {
      log(`${label}: ${formatted}`);
    }
  };

  const tryApproveOnPage = async (page) => {
    let clickedAny = false;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (page.isClosed()) {
        return clickedAny;
      }

      try {
        await fillWalletUnlockIfNeeded(page, password);
        const clicked = await clickFirstEnabled(page, WALLET_ACTION_SELECTORS);
        clickedAny = clickedAny || clicked;
      } catch {
        if (page.isClosed()) {
          return clickedAny;
        }
      }

      await page.waitForTimeout(250).catch(() => {});
    }
    return clickedAny;
  };

  for (const page of context.pages()) {
    const url = page.url();
    if (!url.startsWith(`chrome-extension://${extensionId}/`)) {
      continue;
    }
    await logExtensionButtons(page, `Wallet extension buttons (${url})`);
    try {
      if (await tryApproveOnPage(page)) {
        return true;
      }
    } catch {
      // ignore transient extension page lifecycle errors
    }
  }

  const fallbackUrls = [
    `chrome-extension://${extensionId}/popup-init.html`,
    `chrome-extension://${extensionId}/popup.html`,
    `chrome-extension://${extensionId}/notification.html`,
    `chrome-extension://${extensionId}/home.html`,
  ];
  for (const url of fallbackUrls) {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await logExtensionButtons(
        page,
        `Wallet extension fallback buttons (${url})`,
      );
      if (await tryApproveOnPage(page)) {
        return true;
      }
    } finally {
      await page.close().catch(() => {});
    }
  }

  return false;
};

const clickWithRetries = async (action, attempts = 6, delayMs = 500) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await action();
      return true;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  if (lastError) {
    throw lastError;
  }

  return false;
};

const clickFirstVisibleSelector = async (page, selectors, timeoutMs = 8000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const locator = page.locator(selector);
      const count = await locator.count().catch(() => 0);
      for (let index = 0; index < count; index += 1) {
        const candidate = locator.nth(index);
        const visible = await candidate
          .isVisible({ timeout: 250 })
          .catch(() => false);
        if (!visible) {
          continue;
        }
        const enabled = await candidate.isEnabled().catch(() => false);
        if (!enabled) {
          continue;
        }
        const clicked = await candidate
          .click({ timeout: 2500, force: true })
          .then(() => true)
          .catch(() => false);
        if (clicked) {
          return true;
        }
      }
    }
    await page.waitForTimeout(250).catch(() => {});
  }
  return false;
};

const clickWalletConnectorOption = async (page, url, timeoutMs = 8000) => {
  const clickedWalletOption = await clickFirstVisibleSelector(
    page,
    WALLET_OPTION_SELECTORS,
    timeoutMs,
  );
  if (clickedWalletOption) {
    log(`Wallet preconnect for ${url}: wallet connector option click issued.`);
    return true;
  }

  log(
    `Wallet preconnect for ${url}: wallet connector option not visible; continuing.`,
  );
  await logVisibleButtons(
    page,
    `Wallet preconnect connector snapshot for ${url}`,
  );
  return false;
};

const closeWalletModalIfOpen = async (page, url) => {
  const closed = await clickFirstEnabled(page, [
    'button:text-matches("^\\s*Close\\s*$", "i")',
    '[role="button"]:text-matches("^\\s*Close\\s*$", "i")',
    '[aria-label="Close"]',
  ]);
  if (closed) {
    log(`Wallet preconnect for ${url}: closed wallet modal.`);
    await page.waitForTimeout(300).catch(() => {});
  }
};

const withTimeout = async (promise, timeoutMs, fallbackValue) => {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(fallbackValue), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const logVisibleButtons = async (page, label) => {
  const buttons = await page
    .evaluate(() => {
      return [...document.querySelectorAll('button')]
        .slice(0, 30)
        .map((button) => ({
          text: (button.textContent ?? '').trim().replace(/\s+/g, ' '),
          disabled: button.disabled,
          ariaDisabled: button.getAttribute('aria-disabled'),
        }))
        .filter((entry) => entry.text.length > 0);
    })
    .catch(() => []);

  if (!Array.isArray(buttons) || buttons.length === 0) {
    log(`${label}: no visible button diagnostics available.`);
    return;
  }

  const preview = buttons
    .slice(0, 12)
    .map(
      (entry) =>
        `[${entry.disabled || entry.ariaDisabled === 'true' ? 'disabled' : 'enabled'}] ${entry.text}`,
    )
    .join(' | ');
  log(`${label}: ${preview}`);
};

const logWalletStorageSnapshot = async (page, label) => {
  const snapshot = await page
    .evaluate(() => {
      return {
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage),
      };
    })
    .catch(() => ({ localStorageKeys: [], sessionStorageKeys: [] }));

  const localPreview = Array.isArray(snapshot.localStorageKeys)
    ? snapshot.localStorageKeys.slice(0, 12).join(', ')
    : '';
  const sessionPreview = Array.isArray(snapshot.sessionStorageKeys)
    ? snapshot.sessionStorageKeys.slice(0, 12).join(', ')
    : '';
  log(
    `${label}: localStorage=[${localPreview || 'empty'}] sessionStorage=[${sessionPreview || 'empty'}]`,
  );
};

const readWalletChainId = async (page) => {
  const result = await withTimeout(
    page
      .evaluate(async () => {
        const provider = window.ethereum;
        if (!provider?.request) {
          return null;
        }

        try {
          const chainId = await provider.request({ method: 'eth_chainId' });
          return typeof chainId === 'string' ? chainId : null;
        } catch {
          return null;
        }
      })
      .catch(() => null),
    12_000,
    null,
  );
  return typeof result === 'string' || result === null ? result : null;
};

const readWalletAccounts = async (page) => {
  const result = await withTimeout(
    page
      .evaluate(async () => {
        const provider = window.ethereum;
        if (!provider?.request) {
          return [];
        }

        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          return Array.isArray(accounts)
            ? accounts.filter((value) => typeof value === 'string')
            : [];
        } catch {
          return [];
        }
      })
      .catch(() => []),
    12_000,
    [],
  );

  return Array.isArray(result) ? result : [];
};

const rpcRequest = async (method, params = []) => {
  const response = await fetch(runtimeWalletChain.rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(
      `RPC ${method} failed: ${
        typeof payload.error?.message === 'string'
          ? payload.error.message
          : JSON.stringify(payload.error)
      }`,
    );
  }

  return payload?.result;
};

const parseHexToBigInt = (hexValue) => {
  if (typeof hexValue !== 'string' || !hexValue.startsWith('0x')) {
    return null;
  }

  try {
    return BigInt(hexValue);
  } catch {
    return null;
  }
};

const toHexWei = (value) => `0x${value.toString(16)}`;

const ensureLocalWalletFunding = async (accounts) => {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return { ok: false, reason: 'no-accounts', fundedCount: 0 };
  }

  let fundedCount = 0;

  for (const rawAddress of accounts) {
    const address =
      typeof rawAddress === 'string' && rawAddress.startsWith('0x')
        ? rawAddress
        : null;
    if (!address) {
      continue;
    }

    const balanceHex = await rpcRequest('eth_getBalance', [address, 'latest']);
    const balanceWei = parseHexToBigInt(balanceHex);
    if (balanceWei === null) {
      throw new Error(
        `Unable to parse balance for ${address}: ${String(balanceHex)}`,
      );
    }

    if (balanceWei >= MIN_LOCAL_BALANCE_WEI) {
      log(
        `Wallet funding check for ${address}: sufficient balance (${balanceWei.toString()} wei).`,
      );
      continue;
    }

    // Prefer direct balance assignment on Anvil for deterministic local tests.
    await rpcRequest('anvil_setBalance', [
      address,
      toHexWei(TARGET_LOCAL_BALANCE_WEI),
    ]);
    const refreshedHex = await rpcRequest('eth_getBalance', [
      address,
      'latest',
    ]);
    const refreshedWei = parseHexToBigInt(refreshedHex);
    if (refreshedWei !== null && refreshedWei >= MIN_LOCAL_BALANCE_WEI) {
      fundedCount += 1;
      log(
        `Wallet funding check for ${address}: topped up to ${refreshedWei.toString()} wei via anvil_setBalance.`,
      );
      continue;
    }

    // Fallback for non-Anvil local nodes exposing unlocked dev accounts.
    const transferValue =
      TARGET_LOCAL_BALANCE_WEI > balanceWei
        ? TARGET_LOCAL_BALANCE_WEI - balanceWei
        : MIN_LOCAL_BALANCE_WEI;
    await rpcRequest('eth_sendTransaction', [
      {
        from: DEFAULT_LOCAL_FUNDER_ADDRESS,
        to: address,
        value: toHexWei(transferValue),
      },
    ]);

    const finalHex = await rpcRequest('eth_getBalance', [address, 'latest']);
    const finalWei = parseHexToBigInt(finalHex);
    if (finalWei === null || finalWei < MIN_LOCAL_BALANCE_WEI) {
      throw new Error(
        `Wallet funding failed for ${address}; final balance ${String(finalHex)} remained below threshold.`,
      );
    }

    fundedCount += 1;
    log(
      `Wallet funding check for ${address}: topped up to ${finalWei.toString()} wei via eth_sendTransaction.`,
    );
  }

  return { ok: true, fundedCount };
};

const switchWalletToLocalChain = async (page) => {
  const {
    hex: chainIdHex,
    rpcUrl,
    name: chainName,
    nativeCurrency,
  } = runtimeWalletChain;
  const result = await withTimeout(
    page
      .evaluate(
        async ({
          chainId,
          rpcUrl: targetRpcUrl,
          chainName,
          nativeCurrency,
        }) => {
          const provider = window.ethereum;
          if (!provider?.request) {
            return 'no-provider';
          }

          const requestWithTimeout = async (requestPromise, timeoutMs) => {
            return Promise.race([
              requestPromise,
              new Promise((resolve) =>
                setTimeout(() => resolve('__timeout__'), timeoutMs),
              ),
            ]);
          };

          try {
            const switchResult = await requestWithTimeout(
              provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
              }),
              12_000,
            );
            if (switchResult === '__timeout__') {
              return 'switch-timeout';
            }
            return 'switched';
          } catch (switchError) {
            const code =
              typeof switchError === 'object' &&
              switchError &&
              'code' in switchError
                ? Number(switchError.code)
                : undefined;
            if (code !== 4902) {
              return `switch-failed:${
                typeof switchError === 'object' &&
                switchError &&
                'message' in switchError
                  ? String(switchError.message)
                  : String(switchError)
              }`;
            }

            try {
              const addResult = await requestWithTimeout(
                provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId,
                      chainName,
                      nativeCurrency,
                      rpcUrls: [targetRpcUrl],
                    },
                  ],
                }),
                12_000,
              );
              if (addResult === '__timeout__') {
                return 'add-timeout';
              }
              return 'added-and-switched';
            } catch (addError) {
              return `add-failed:${
                typeof addError === 'object' &&
                addError &&
                'message' in addError
                  ? String(addError.message)
                  : String(addError)
              }`;
            }
          }
        },
        {
          chainId: chainIdHex,
          rpcUrl,
          chainName,
          nativeCurrency,
        },
      )
      .catch(
        (error) =>
          `evaluate-failed:${error instanceof Error ? error.message : String(error)}`,
      ),
    15_000,
    'switch-evaluate-timeout',
  );
  return typeof result === 'string' ? result : String(result);
};

const requestWalletAccounts = async (page) => {
  const result = await withTimeout(
    page
      .evaluate(async () => {
        const provider = window.ethereum;
        if (!provider?.request) {
          return 'no-provider';
        }

        const requestWithTimeout = async (requestPromise, timeoutMs) => {
          return Promise.race([
            requestPromise,
            new Promise((resolve) =>
              setTimeout(() => resolve('__timeout__'), timeoutMs),
            ),
          ]);
        };

        try {
          const accounts = await requestWithTimeout(
            provider.request({ method: 'eth_requestAccounts' }),
            12_000,
          );
          if (accounts === '__timeout__') {
            return 'request-timeout';
          }
          return Array.isArray(accounts) && accounts.length > 0
            ? `requested:${accounts.length}`
            : 'requested:0';
        } catch (error) {
          return `request-failed:${
            typeof error === 'object' && error && 'message' in error
              ? String(error.message)
              : String(error)
          }`;
        }
      })
      .catch(
        (error) =>
          `evaluate-failed:${error instanceof Error ? error.message : String(error)}`,
      ),
    15_000,
    'request-evaluate-timeout',
  );

  return typeof result === 'string' ? result : String(result);
};

const waitForWalletAccounts = async (page, timeoutMs = 30_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const accounts = await readWalletAccounts(page);
    if (accounts.length > 0) {
      return accounts;
    }
    await page.waitForTimeout(500).catch(() => {});
  }
  return [];
};

const getWalletStatusForPage = async (page) => {
  const accounts = await readWalletAccounts(page);
  const chainId = await readWalletChainId(page);
  return { accounts, chainId };
};

const ensureWalletOnLocalChain = async (context, page, url) => {
  const accounts = await readWalletAccounts(page);
  if (accounts.length === 0) {
    log(
      `Wallet chain enforcement skipped for ${url}: origin is not connected yet.`,
    );
    return false;
  }

  const attempts = 4;
  let lastResult = 'not-attempted';
  let currentChainId = await readWalletChainId(page);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (currentChainId?.toLowerCase() === runtimeWalletChain.hex) {
      log(
        `Wallet chain for ${url} confirmed as ${runtimeWalletChain.id} (${runtimeWalletChain.hex}).`,
      );
      return true;
    }

    lastResult = await switchWalletToLocalChain(page);
    log(
      `Wallet preconnect chain action for ${url}: attempt=${attempt}/${attempts} result=${lastResult}`,
    );

    if (
      /timeout|already pending|pending/i.test(lastResult) ||
      lastResult.startsWith('add-failed:') ||
      lastResult.startsWith('switch-failed:')
    ) {
      const settled = await settlePendingWalletRequests(
        context,
        DEFAULT_WALLET_PASSWORD,
      );
      if (settled) {
        log(
          `Wallet preconnect chain settle for ${url}: attempted approvals after ${lastResult}`,
        );
      }
    }

    await page.waitForTimeout(1200);
    currentChainId = await readWalletChainId(page);
  }

  log(
    `warning: wallet chain for ${url} remained ${currentChainId ?? 'unknown'} after configured-chain enforcement attempts (target=${runtimeWalletChain.hex}, lastAction=${lastResult})`,
  );
  return false;
};

const primeWalletConnectionForUrl = async (context, url) => {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page
      .evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // ignore storage cleanup failures
        }
      })
      .catch(() => {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const hasConnectButton = await anySelectorVisible(
      page,
      CONNECT_BUTTON_SELECTORS,
      1500,
    );
    if (!hasConnectButton) {
      log(`Wallet preconnect skipped for ${url} (connect button not visible).`);
      await logVisibleButtons(
        page,
        `Wallet preconnect button snapshot for ${url}`,
      );
      const connectedAccounts = await readWalletAccounts(page);
      if (connectedAccounts.length === 0) {
        await clickWalletConnectorOption(page, url, 2500);
        const directRequestResult = await requestWalletAccounts(page);
        log(
          `Wallet preconnect direct account request for ${url}: ${directRequestResult}`,
        );
      }
      const settled = await settlePendingWalletRequests(
        context,
        DEFAULT_WALLET_PASSWORD,
      );
      log(
        `Wallet preconnect pending-request settle for ${url}: ${settled ? 'attempted approvals' : 'no-approvals'}`,
      );
      await ensureWalletOnLocalChain(context, page, url);
      await closeWalletModalIfOpen(page, url);
      return;
    }

    let connectClicked = false;
    let hasReloaded = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const clicked = await clickFirstEnabled(page, CONNECT_BUTTON_SELECTORS);
      if (clicked) {
        connectClicked = true;
        break;
      }

      if (!hasReloaded && attempt === 20) {
        hasReloaded = true;
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      }
      await page.waitForTimeout(500);
    }
    if (!connectClicked) {
      log(
        `Wallet preconnect for ${url}: connect button remained disabled; continuing.`,
      );
      await logVisibleButtons(
        page,
        `Wallet preconnect button snapshot for ${url}`,
      );
      await logWalletStorageSnapshot(
        page,
        `Wallet preconnect storage snapshot for ${url}`,
      );
      const connectedAccounts = await readWalletAccounts(page);
      if (connectedAccounts.length === 0) {
        await page
          .evaluate(() => {
            try {
              localStorage.removeItem('wagmi.store');
              sessionStorage.clear();
            } catch {
              // Ignore storage cleanup failures.
            }
          })
          .catch(() => {});
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(1200).catch(() => {});
        await clickWalletConnectorOption(page, url, 3500);
        const directRequestResult = await requestWalletAccounts(page);
        log(
          `Wallet preconnect direct account request for ${url}: ${directRequestResult}`,
        );
        const settled = await settlePendingWalletRequests(
          context,
          DEFAULT_WALLET_PASSWORD,
        );
        log(
          `Wallet preconnect pending-request settle for ${url}: ${settled ? 'attempted approvals' : 'no-approvals'}`,
        );
        const recoveredAccounts = await waitForWalletAccounts(page, 10_000);
        if (recoveredAccounts.length === 0) {
          log(
            `Wallet preconnect for ${url}: origin not connected after recovery; skipping chain enforcement.`,
          );
          await closeWalletModalIfOpen(page, url);
          return;
        }
        await ensureWalletOnLocalChain(context, page, url);
        await closeWalletModalIfOpen(page, url);
        return;
      }
      await ensureWalletOnLocalChain(context, page, url);
      await closeWalletModalIfOpen(page, url);
      return;
    }
    log(`Wallet preconnect for ${url}: connect button click issued.`);

    let initiatedConnectorFlow = false;
    if (connectClicked) {
      const clickedWalletOption = await clickWalletConnectorOption(
        page,
        url,
        8000,
      );
      if (clickedWalletOption) {
        initiatedConnectorFlow = true;
      }
    }

    let requestAccountsResult = 'skipped';
    if (initiatedConnectorFlow) {
      const connectedAccounts = await waitForWalletAccounts(page, 15_000);
      requestAccountsResult =
        connectedAccounts.length > 0
          ? `connector-accounts:${connectedAccounts.length}`
          : 'connector-timeout';
    } else {
      requestAccountsResult = await requestWalletAccounts(page);
    }

    const noProviderResult =
      requestAccountsResult === 'no-provider' ||
      /request-failed:.*no ethereum provider/i.test(requestAccountsResult);
    if (noProviderResult || requestAccountsResult === 'connector-timeout') {
      const clickedWalletOption = await clickWalletConnectorOption(
        page,
        url,
        8000,
      );
      initiatedConnectorFlow = initiatedConnectorFlow || clickedWalletOption;
      if (initiatedConnectorFlow) {
        const connectedAccounts = await waitForWalletAccounts(page, 15_000);
        requestAccountsResult =
          connectedAccounts.length > 0
            ? `connector-accounts:${connectedAccounts.length}`
            : 'connector-timeout';
      } else if (noProviderResult) {
        requestAccountsResult = await requestWalletAccounts(page);
      }
    }

    log(
      `Wallet preconnect account request for ${url}: ${requestAccountsResult}`,
    );
    if (
      requestAccountsResult.includes('already pending') ||
      requestAccountsResult === 'connector-timeout' ||
      requestAccountsResult === 'request-timeout'
    ) {
      if (requestAccountsResult === 'connector-timeout') {
        await clickWalletConnectorOption(page, url, 4000);
        const directRequestResult = await requestWalletAccounts(page);
        log(
          `Wallet preconnect direct account request for ${url}: ${directRequestResult}`,
        );
      }

      const settled = await settlePendingWalletRequests(
        context,
        DEFAULT_WALLET_PASSWORD,
      );
      log(
        `Wallet preconnect pending-request settle for ${url}: ${settled ? 'attempted approvals' : 'no-approvals'}`,
      );
      const connectedAccounts = await waitForWalletAccounts(page, 15_000);
      if (connectedAccounts.length > 0) {
        requestAccountsResult = `post-settle-accounts:${connectedAccounts.length}`;
      } else if (!initiatedConnectorFlow) {
        requestAccountsResult = await requestWalletAccounts(page);
      } else {
        requestAccountsResult = 'post-settle-timeout';
      }
      log(
        `Wallet preconnect account request retry for ${url}: ${requestAccountsResult}`,
      );
    }
    await page.waitForTimeout(1000);

    await ensureWalletOnLocalChain(context, page, url);
    await closeWalletModalIfOpen(page, url);

    await page
      .waitForFunction(
        () => {
          const labels = [...document.querySelectorAll('button')]
            .map((button) => (button.textContent ?? '').trim())
            .filter(Boolean);
          return !labels.some((label) => /connecting/i.test(label));
        },
        { timeout: 45000 },
      )
      .catch(() => {});

    await ensureWalletOnLocalChain(context, page, url);
    await closeWalletModalIfOpen(page, url);

    log(`Wallet preconnect attempted for ${url}.`);
  } finally {
    await page.close().catch(() => {});
  }
};

const verifyWalletReadyForOrigin = async (context, url) => {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1000).catch(() => {});

    let { accounts, chainId } = await getWalletStatusForPage(page);
    if (accounts.length === 0) {
      await settlePendingWalletRequests(context, DEFAULT_WALLET_PASSWORD);
      accounts = await waitForWalletAccounts(page, 10_000);
      chainId = await readWalletChainId(page);
    }

    if (
      accounts.length > 0 &&
      chainId?.toLowerCase() !== runtimeWalletChain.hex
    ) {
      await ensureWalletOnLocalChain(context, page, url);
      const refreshed = await getWalletStatusForPage(page);
      accounts = refreshed.accounts;
      chainId = refreshed.chainId;
    }

    if (
      accounts.length > 0 &&
      chainId?.toLowerCase() === runtimeWalletChain.hex &&
      isLoopbackRpcUrl(runtimeWalletChain.rpcUrl)
    ) {
      try {
        const fundingResult = await ensureLocalWalletFunding(accounts);
        if (fundingResult.ok && fundingResult.fundedCount > 0) {
          log(
            `Wallet preflight for ${url}: funded ${fundingResult.fundedCount} account(s) for local chain tests.`,
          );
        }
      } catch (error) {
        log(
          `warning: local wallet funding failed for ${url}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    const ready =
      accounts.length > 0 && chainId?.toLowerCase() === runtimeWalletChain.hex;
    log(
      `Wallet preflight for ${url}: accounts=${accounts.length} chainId=${chainId ?? 'unknown'} ready=${ready}`,
    );
    return {
      ready,
      accounts,
      chainId,
    };
  } finally {
    await page.close().catch(() => {});
  }
};

const runStrictWalletPreflight = async (context, seedUrls) => {
  for (const seedUrl of seedUrls) {
    await primeWalletConnectionForUrl(context, seedUrl);
    const verification = await verifyWalletReadyForOrigin(context, seedUrl);
    if (!verification.ready) {
      return {
        ok: false,
        failedUrl: seedUrl,
        verification,
      };
    }
  }

  return { ok: true };
};

const runLocalWalletFundingVerification = async (context, seedUrls) => {
  for (const seedUrl of seedUrls) {
    const verification = await verifyWalletReadyForOrigin(context, seedUrl);
    if (!verification.ready) {
      return {
        ok: false,
        failedUrl: seedUrl,
        verification,
      };
    }
  }

  return { ok: true };
};

const cloneWalletProfile = (sourceDir, destinationDir) => {
  fs.rmSync(destinationDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destinationDir), { recursive: true });
  fs.cpSync(sourceDir, destinationDir, { recursive: true, force: true });

  for (const singletonFile of [
    'SingletonCookie',
    'SingletonLock',
    'SingletonSocket',
  ]) {
    fs.rmSync(path.join(destinationDir, singletonFile), { force: true });
  }
};

const executeWithWalletFallback = async (driver, action) => {
  const result = await driver.execute(action);
  if (result?.success !== false) {
    return result;
  }

  const message =
    result?.error ??
    (typeof result === 'string' ? result : JSON.stringify(result ?? {}));
  const page = driver.getPage?.();
  if (!page || action?.action !== 'click') {
    return result;
  }

  if (/(MetaMask|Browser Wallet|Injected|Ethereum Wallet)/i.test(message)) {
    const connectingButton = page
      .locator('button:has-text("Connecting")')
      .first();
    const alreadyConnecting = await connectingButton
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (alreadyConnecting) {
      log('Recovered MetaMask click by detecting active Connecting state.');
      return { success: true, recovered: true };
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (
        await clickFirstVisibleSelector(page, WALLET_OPTION_SELECTORS, 1200)
      ) {
        log('Recovered MetaMask click via forced fallback.');
        return { success: true, recovered: true };
      }

      const connectClicked = await clickFirstEnabled(
        page,
        CONNECT_BUTTON_SELECTORS,
      );
      if (!connectClicked) {
        await anySelectorVisible(page, CONNECT_BUTTON_SELECTORS, 500);
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    return result;
  }

  if (/Failed to connect/i.test(message)) {
    const connectClicked = await clickFirstEnabled(
      page,
      CONNECT_BUTTON_SELECTORS,
    );
    if (connectClicked) {
      await clickFirstVisibleSelector(page, WALLET_OPTION_SELECTORS, 2500);
      await ensureWalletOnLocalChain(page.context(), page, 'runtime-fallback');
      log(
        'Recovered wallet connection failure by reopening Connect + MetaMask.',
      );
      return { success: true, recovered: true };
    }
  }

  if (/detached|not attached/i.test(message)) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await page.waitForTimeout(200).catch(() => {});
      const retried = await driver.execute(action).catch(() => null);
      if (retried?.success !== false) {
        log(
          `Recovered detached click by retrying original action (attempt ${attempt}/3).`,
        );
        return { ...(retried ?? {}), success: true, recovered: true };
      }
    }
  }

  if (/Ether \(ETH\)/i.test(message)) {
    const ethOption = page.getByText('Ether (ETH)').first();
    const ethVisible = await ethOption
      .isVisible({ timeout: 1200 })
      .catch(() => false);
    if (ethVisible) {
      await clickWithRetries(
        async () => {
          await ethOption.click({ timeout: 2500, force: true });
        },
        4,
        300,
      );
      log('Recovered Ether asset click via forced fallback.');
      return { success: true, recovered: true };
    }
  }

  return result;
};

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

const safeInteger = (value, label) => {
  const parsed = safeNumber(value, label);
  if (parsed === undefined) {
    return undefined;
  }
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} must be an integer. Received: ${value}`);
  }
  return parsed;
};

const normalizeChainHex = (value, label) => {
  if (typeof value !== 'string' || !/^0x[0-9a-fA-F]+$/.test(value)) {
    throw new Error(
      `${label} must be a hex chain id like 0x7a69. Received: ${value}`,
    );
  }

  return `0x${BigInt(value).toString(16)}`;
};

const getReadyManualSignoffFlowIds = (csvPath) => {
  const raw = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = raw.split(/\r?\n/).slice(1);

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        line.slice(line.lastIndexOf(',') + 1).trim() === 'ready-manual-signoff',
    )
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
      errors.push(
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
      );
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
  const personaFilter = new Set(
    filters.personas.map((entry) => entry.toLowerCase()),
  );
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

const argv = process.argv.slice(2);
const normalizedArgv = argv.filter((arg) => arg !== '--');

const options = parseArgs({
  args: normalizedArgv,
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
    'wallet-chain-id': { type: 'string' },
    'wallet-chain-hex': { type: 'string' },
    'wallet-rpc-url': { type: 'string' },
    'wallet-chain-name': { type: 'string' },
    'wallet-native-name': { type: 'string' },
    'wallet-native-symbol': { type: 'string' },
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
  --wallet-chain-id <n>           Target wallet chain id for preflight/enforcement
  --wallet-chain-hex <hex>        Target wallet chain hex id (e.g. 0x7a69)
  --wallet-rpc-url <url>          Target chain RPC URL used for add/switch + funding checks
  --wallet-chain-name <name>      Target chain name used for wallet_addEthereumChain
  --wallet-native-name <name>     Native currency name for wallet_addEthereumChain
  --wallet-native-symbol <sym>    Native currency symbol for wallet_addEthereumChain
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
  const walletChainIdOverride = safeInteger(
    options['wallet-chain-id'],
    '--wallet-chain-id',
  );
  const walletChainHexOverride = options['wallet-chain-hex']
    ? normalizeChainHex(options['wallet-chain-hex'], '--wallet-chain-hex')
    : undefined;
  if (
    walletChainIdOverride !== undefined &&
    walletChainHexOverride !== undefined
  ) {
    const normalizedFromId = `0x${walletChainIdOverride.toString(16)}`;
    if (normalizedFromId !== walletChainHexOverride) {
      throw new Error(
        `--wallet-chain-id (${walletChainIdOverride}) does not match --wallet-chain-hex (${walletChainHexOverride}).`,
      );
    }
  }
  const resolvedWalletChainId =
    walletChainIdOverride ??
    (walletChainHexOverride !== undefined
      ? Number(BigInt(walletChainHexOverride))
      : runtimeWalletChain.id);
  if (
    !Number.isSafeInteger(resolvedWalletChainId) ||
    resolvedWalletChainId <= 0
  ) {
    throw new Error(
      `Wallet chain id must be a positive safe integer. Received: ${resolvedWalletChainId}`,
    );
  }
  runtimeWalletChain = {
    ...runtimeWalletChain,
    id: resolvedWalletChainId,
    hex: walletChainHexOverride ?? `0x${resolvedWalletChainId.toString(16)}`,
    rpcUrl: options['wallet-rpc-url'] ?? runtimeWalletChain.rpcUrl,
    name: options['wallet-chain-name'] ?? runtimeWalletChain.name,
    nativeCurrency: {
      ...runtimeWalletChain.nativeCurrency,
      name:
        options['wallet-native-name'] ?? runtimeWalletChain.nativeCurrency.name,
      symbol:
        options['wallet-native-symbol'] ??
        runtimeWalletChain.nativeCurrency.symbol,
    },
  };

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
    } else if (
      next.maxTurns === undefined &&
      mergedConfig.maxTurns !== undefined
    ) {
      next.maxTurns = mergedConfig.maxTurns;
    }

    if (timeoutOverride !== undefined) {
      next.timeoutMs = timeoutOverride;
    } else if (
      next.timeoutMs === undefined &&
      mergedConfig.timeoutMs !== undefined
    ) {
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
  const externalStartWalletAutoApprover =
    typeof driverModule.startWalletAutoApprover === 'function'
      ? driverModule.startWalletAutoApprover
      : undefined;
  const externalRunWalletPreflight =
    typeof driverModule.runWalletPreflight === 'function'
      ? driverModule.runWalletPreflight
      : undefined;
  const externalSettleWalletPrompts =
    typeof driverModule.settleWalletPrompts === 'function'
      ? driverModule.settleWalletPrompts
      : undefined;

  const { chromium } = playwrightModule;

  const fileConfig = await loadConfig(configPath);
  const mergedConfig = mergeConfig(fileConfig, runtimeOverrides);
  const launchPlan = buildBrowserLaunchPlan(mergedConfig, {
    cwd: process.cwd(),
  });

  const selectedWalletRequiredCases = selectedCases.filter((testCase) =>
    (testCase.tags ?? []).includes('wallet-required'),
  );
  const hasWalletRequiredCases = selectedWalletRequiredCases.length > 0;
  const originSeedUrls = (() => {
    const urls = new Map();
    for (const testCase of selectedWalletRequiredCases) {
      try {
        const parsed = new URL(testCase.startUrl);
        if (!urls.has(parsed.origin)) {
          urls.set(parsed.origin, testCase.startUrl);
        }
      } catch {
        // Ignore malformed case URLs.
      }
    }
    return [...urls.values()];
  })();
  const resolvedUserDataDir =
    launchPlan.userDataDir ?? path.resolve('.agent-wallet-profile');
  const profileExtensionsDir = path.join(
    resolvedUserDataDir,
    'Default',
    'Extensions',
  );
  const profileHasExtensions =
    fs.existsSync(profileExtensionsDir) &&
    fs
      .readdirSync(profileExtensionsDir, { withFileTypes: true })
      .some((entry) => entry.isDirectory());

  if (hasWalletRequiredCases && !launchPlan.walletMode) {
    throw new Error(
      `Selected flows include wallet-required cases (${selectedWalletRequiredCases
        .map((testCase) => testCase.id)
        .join(', ')}), but wallet mode is disabled.`,
    );
  }

  if (
    hasWalletRequiredCases &&
    launchPlan.walletMode &&
    launchPlan.extensionPaths.length === 0 &&
    !profileHasExtensions
  ) {
    throw new Error(
      [
        'Selected flows require a wallet extension, but none is configured.',
        `Wallet-required flow IDs: ${selectedWalletRequiredCases
          .map((testCase) => testCase.id)
          .join(', ')}`,
        'Provide AGENT_WALLET_EXTENSION_PATHS/--wallet-extension or pre-seed extension data in AGENT_WALLET_USER_DATA_DIR/--wallet-user-data-dir.',
      ].join('\n'),
    );
  }

  const outputDir = path.resolve(
    mergedConfig.outputDir ?? './agent-results/wallet-flows',
  );
  fs.mkdirSync(outputDir, { recursive: true });

  log(`Output directory: ${outputDir}`);
  log(
    `Launch mode: wallet=${launchPlan.walletMode} headless=${launchPlan.headless} concurrency=${launchPlan.concurrency}`,
  );
  log(
    `Wallet chain target: id=${runtimeWalletChain.id} hex=${runtimeWalletChain.hex} rpc=${runtimeWalletChain.rpcUrl}`,
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
  let stopWalletAutoApprover;
  let stopWalletPromptSettler;

  const launchWalletContext = async (userDataDir) => {
    fs.mkdirSync(userDataDir, { recursive: true });
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      headless: launchPlan.headless,
      args: launchPlan.browserArgs,
      viewport: launchPlan.viewport,
      ignoreHTTPSErrors: true,
    });
    log(`Wallet mode persistent context: ${userDataDir}`);
    const stop = externalStartWalletAutoApprover
      ? await externalStartWalletAutoApprover(context, {
          password: DEFAULT_WALLET_PASSWORD,
          log: (message) => log(`[wallet-lib] ${message}`),
        })
      : await startWalletAutoApprover(context, DEFAULT_WALLET_PASSWORD);

    let active = true;
    let settling = false;
    const settleTick = async () => {
      if (!active || settling) {
        return;
      }

      settling = true;
      try {
        if (externalSettleWalletPrompts) {
          await externalSettleWalletPrompts(context, {
            password: DEFAULT_WALLET_PASSWORD,
            log: (message) => log(`[wallet-lib] ${message}`),
          });
        } else {
          await settlePendingWalletRequests(context, DEFAULT_WALLET_PASSWORD);
        }
      } catch {
        // Ignore transient extension prompt automation errors.
      } finally {
        settling = false;
      }
    };

    const interval = setInterval(() => {
      void settleTick();
    }, 3_000);
    void settleTick();

    const stopSettler = () => {
      active = false;
      clearInterval(interval);
    };

    return { context, stop, stopSettler };
  };

  const closeWalletContext = async () => {
    stopWalletAutoApprover?.();
    stopWalletAutoApprover = undefined;
    stopWalletPromptSettler?.();
    stopWalletPromptSettler = undefined;
    await persistentContext?.close().catch(() => {});
    persistentContext = undefined;
  };

  const createDriver = async () => {
    const context = persistentContext
      ? persistentContext
      : await browser.newContext({
          viewport: launchPlan.viewport,
          ignoreHTTPSErrors: true,
        });

    const page = await context.newPage();
    if (options.debug) {
      page.on('console', (msg) => {
        log(`[browser:${msg.type()}] ${msg.text()}`);
      });
      page.on('pageerror', (error) => {
        log(`[browser:error] ${error.message}`);
      });
    }
    const driver = new PlaywrightDriver(page, {
      captureScreenshots: Boolean(mergedConfig.vision),
    });

    return {
      observe: () => driver.observe(),
      execute: (action) => executeWithWalletFallback(driver, action),
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
      let userDataDir = resolvedUserDataDir;
      const maxWalletPreflightAttempts = hasWalletRequiredCases ? 3 : 1;
      let lastPreflightFailure = null;

      for (
        let attempt = 1;
        attempt <= maxWalletPreflightAttempts;
        attempt += 1
      ) {
        const walletSession = await launchWalletContext(userDataDir);
        persistentContext = walletSession.context;
        stopWalletAutoApprover = walletSession.stop;
        stopWalletPromptSettler = walletSession.stopSettler;

        if (!hasWalletRequiredCases) {
          lastPreflightFailure = null;
          break;
        }

        const preflight = externalRunWalletPreflight
          ? await externalRunWalletPreflight(persistentContext, {
              seedUrls: originSeedUrls,
              password: DEFAULT_WALLET_PASSWORD,
              chain: {
                id: runtimeWalletChain.id,
                hex: runtimeWalletChain.hex,
                rpcUrl: runtimeWalletChain.rpcUrl,
                name: runtimeWalletChain.name,
                nativeCurrency: runtimeWalletChain.nativeCurrency,
              },
              log: (message) => log(`[wallet-lib] ${message}`),
            })
          : await runStrictWalletPreflight(persistentContext, originSeedUrls);
        let normalizedFailure = null;
        if (!preflight.ok) {
          if (externalRunWalletPreflight) {
            log(
              'External wallet preflight failed; attempting local strict fallback.',
            );
            const localPreflight = await runStrictWalletPreflight(
              persistentContext,
              originSeedUrls,
            );
            if (localPreflight.ok) {
              log(
                'Local strict wallet preflight succeeded after external failure.',
              );
              const fundingVerification =
                await runLocalWalletFundingVerification(
                  persistentContext,
                  originSeedUrls,
                );
              if (fundingVerification.ok) {
                lastPreflightFailure = null;
                break;
              }

              normalizedFailure = fundingVerification;
            } else {
              normalizedFailure = localPreflight;
            }
          }

          if (normalizedFailure === null) {
            normalizedFailure = externalRunWalletPreflight
              ? (() => {
                  const failedResult = preflight.results?.find(
                    (resultEntry) => !resultEntry.ready,
                  );
                  return {
                    ok: false,
                    failedUrl: preflight.failedUrl ?? failedResult?.url,
                    verification: {
                      accounts: failedResult?.accounts ?? [],
                      chainId: failedResult?.chainId ?? null,
                    },
                  };
                })()
              : preflight;
          }
        } else {
          const fundingVerification = await runLocalWalletFundingVerification(
            persistentContext,
            originSeedUrls,
          );

          if (fundingVerification.ok) {
            lastPreflightFailure = null;
            break;
          }

          normalizedFailure = fundingVerification;
        }

        lastPreflightFailure = normalizedFailure;
        log(
          `warning: wallet preflight attempt ${attempt}/${maxWalletPreflightAttempts} failed for ${normalizedFailure.failedUrl}`,
        );
        await closeWalletContext();

        if (attempt < maxWalletPreflightAttempts) {
          const recycledUserDataDir = `${resolvedUserDataDir}-recycle-${Date.now()}-${attempt}`;
          if (fs.existsSync(resolvedUserDataDir)) {
            cloneWalletProfile(resolvedUserDataDir, recycledUserDataDir);
          }
          userDataDir = recycledUserDataDir;
          log(
            `Recycling wallet context with fresh profile directory: ${userDataDir}`,
          );
        }
      }

      if (lastPreflightFailure) {
        const preflightFailureMessage = [
          'Wallet preflight failed after automatic retries.',
          `Failed origin: ${lastPreflightFailure.failedUrl}`,
          `Accounts detected: ${lastPreflightFailure.verification?.accounts?.length ?? 0}`,
          `Chain ID: ${lastPreflightFailure.verification?.chainId ?? 'unknown'}`,
        ].join('\n');
        if (process.env.AGENT_STRICT_WALLET_PREFLIGHT === 'true') {
          throw new Error(preflightFailureMessage);
        }
        log(
          `warning: ${preflightFailureMessage.replace(/\n/g, ' | ')} | continuing run without strict preflight gate`,
        );
      }
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
        const criteriaPass = Boolean(result.verified);
        log(
          `${criteriaPass ? 'pass' : 'fail'} ${result.testCase.id} verified=${result.verified} agentSuccess=${result.agentSuccess} verdict=${result.verdict} durationMs=${result.durationMs}`,
        );
        if (criteriaPass && !result.agentSuccess) {
          log(
            `warning: ${result.testCase.id} met success criteria but agent ended unsuccessfully.`,
          );
        }
      },
    });

    const suite = await testRunner.runSuite(
      selectedCases.map((testCase) => applyCaseRuntimeOverrides(testCase)),
    );

    const strictPassed = suite.results.filter((result) =>
      Boolean(result.verified),
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
    await closeWalletContext();
    await browser?.close().catch(() => {});
  }
};

main().catch((error) => {
  console.error(
    `[wallet-flows] fatal: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
  );
  process.exit(1);
});
