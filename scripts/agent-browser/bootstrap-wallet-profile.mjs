#!/usr/bin/env node

import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const DEFAULT_MNEMONIC =
  'test test test test test test test test test test test junk';
const DEFAULT_PASSWORD = 'TangleLocal123!';
const parseBoolean = (value, fallback = false) => {
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

const options = parseArgs({
  options: {
    'extension-path': { type: 'string' },
    'user-data-dir': { type: 'string' },
    mnemonic: { type: 'string' },
    password: { type: 'string' },
    headless: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
}).values;

if (options.help) {
  console.log(`\
Usage:
  node scripts/agent-browser/bootstrap-wallet-profile.mjs [options]

Options:
  --extension-path <path>    Unpacked wallet extension path (required)
  --user-data-dir <path>     Persistent Chromium user data dir (default: ./.agent-wallet-profile)
  --mnemonic <phrase>        Seed phrase to import (default: anvil test mnemonic)
  --password <value>         Wallet password for unlock/import (default: ${DEFAULT_PASSWORD})
  --headless                 Run bootstrap in headless mode
  -h, --help                 Show this help
`);
  process.exit(0);
}

if (!options['extension-path']) {
  throw new Error('--extension-path is required');
}

const extensionPath = path.resolve(options['extension-path']);
const userDataDir = path.resolve(
  options['user-data-dir'] ?? './.agent-wallet-profile',
);
const mnemonic = (options.mnemonic ?? DEFAULT_MNEMONIC).trim();
const password = options.password ?? DEFAULT_PASSWORD;
const headless = parseBoolean(
  options.headless ?? process.env.AGENT_BROWSER_HEADLESS,
  false,
);

const log = (message) => console.log(`[wallet-bootstrap] ${message}`);

const dumpPageState = async (page, label) => {
  log(`${label}: url=${page.url()}`);
};

const findFirstVisibleLocator = async (page, selectors, timeout = 1500) => {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.isVisible({ timeout })) {
        return locator;
      }
    } catch {
      // Try next selector.
    }
  }

  return null;
};

const waitForAnyVisible = async (page, selectors, timeoutMs = 15000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const locator = await findFirstVisibleLocator(page, selectors, 600);
    if (locator) return locator;
    await page.waitForTimeout(250);
  }
  return null;
};

const clickFirstVisible = async (page, selectors, timeoutMs = 12000) => {
  const locator = await waitForAnyVisible(page, selectors, timeoutMs);
  if (!locator) return false;
  await locator.click({ timeout: 5000 });
  return true;
};

const fillFirstVisible = async (page, selectors, value, timeoutMs = 12000) => {
  const locator = await waitForAnyVisible(page, selectors, timeoutMs);
  if (!locator) return false;
  await locator.fill(value, { timeout: 5000 });
  return true;
};

const clickFirstEnabled = async (page, selectors, timeoutMs = 12000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const locator = await findFirstVisibleLocator(page, selectors, 600);
    if (locator) {
      const enabled = await locator.isEnabled().catch(() => false);
      if (enabled) {
        await locator.click({ timeout: 5000 });
        return true;
      }
    }
    await page.waitForTimeout(250);
  }

  return false;
};

const typeIntoLocatorWithFallback = async (page, locator, value) => {
  await locator.click({ timeout: 5000 });
  await locator.fill('', { timeout: 5000 });
  await page.keyboard.press('Control+A').catch(() => {});
  await page.keyboard.press('Backspace').catch(() => {});
  await page.keyboard.type(value, { delay: 18 });
  await locator.evaluate((el) => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  });
};

const fillRecoveryPhrase = async (page, phrase) => {
  const words = phrase.split(/\s+/).filter(Boolean);
  const firstWordInput = page.locator('[data-testid="import-srp__srp-word-0"]');
  const hasWordInputs = await firstWordInput
    .first()
    .isVisible({ timeout: 1200 })
    .catch(() => false);

  if (hasWordInputs) {
    for (let index = 0; index < words.length; index += 1) {
      const wordInput = page.locator(
        `[data-testid="import-srp__srp-word-${index}"]`,
      );
      await wordInput.first().fill(words[index], { timeout: 3000 });
    }

    return true;
  }

  const phraseInput = await findFirstVisibleLocator(page, [
    '[data-testid="import-srp__srp-text-area"]',
    'textarea',
    'input[placeholder*="secret" i]',
    'input[placeholder*="recovery" i]',
  ]);
  if (!phraseInput) {
    return false;
  }

  await phraseInput.fill(phrase, { timeout: 5000 });
  await page.waitForTimeout(250);
  const continueButton = await findFirstVisibleLocator(
    page,
    ['[data-testid="import-srp-confirm"]', 'button:has-text("Continue")'],
    800,
  );
  if (continueButton) {
    const enabled = await continueButton.isEnabled().catch(() => true);
    if (!enabled) {
      const fallbackInput = await findFirstVisibleLocator(
        page,
        ['[data-testid="import-srp__srp-text-area"]', 'textarea'],
        1500,
      );
      if (fallbackInput) {
        await typeIntoLocatorWithFallback(page, fallbackInput, phrase).catch(
          () => {},
        );
      }
      const stillDisabled = await continueButton
        .isDisabled()
        .catch(() => false);
      if (stillDisabled && fallbackInput) {
        await fallbackInput
          .evaluate((el, nextValue) => {
            // Some onboarding variants require a native input event after value assignment.
            el.value = nextValue;
            el.dispatchEvent(new InputEvent('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, phrase)
          .catch(() => {});
      }
    }
  }

  return true;
};

const waitForWalletReady = async (page) => {
  const readySelectors = [
    '[data-testid="account-menu-icon"]',
    '[data-testid="network-display"]',
    'text=/Account\\s+[0-9]+/i',
    'text=/Portfolio/i',
  ];

  for (let attempt = 0; attempt < 30; attempt += 1) {
    for (const selector of readySelectors) {
      const visible = await page
        .locator(selector)
        .first()
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (visible) {
        return true;
      }
    }

    if (page.isClosed()) {
      return false;
    }

    await page.waitForTimeout(1000).catch(() => {});
  }

  return false;
};

const main = async () => {
  const args = [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ];

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless,
    args,
  });

  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) {
      worker = await context.waitForEvent('serviceworker', { timeout: 30000 });
    }
    const extensionId = new URL(worker.url()).host;
    const extensionHomeUrl = `chrome-extension://${extensionId}/home.html`;
    log(`Detected extension id: ${extensionId}`);

    let page = await context.newPage();
    await page.goto(extensionHomeUrl, { waitUntil: 'domcontentloaded' });
    await waitForAnyVisible(
      page,
      [
        '[data-testid="unlock-password"]',
        'input[type="password"]',
        '[data-testid="onboarding-get-started"]',
        '[data-testid="onboarding-import-wallet"]',
        'button:has-text("I have an existing wallet")',
        'button:has-text("Create a new wallet")',
      ],
      30000,
    );

    if (await waitForWalletReady(page)) {
      log('Wallet profile already initialized and ready.');
      return;
    }

    if (page.isClosed()) {
      page = await context.newPage();
      await page.goto(extensionHomeUrl, { waitUntil: 'domcontentloaded' });
    }

    const initialUrl = page.url();
    if (
      !initialUrl.includes('/onboarding/') &&
      !initialUrl.includes('/unlock')
    ) {
      log(
        `Wallet home loaded (${initialUrl}); treating profile as initialized.`,
      );
      return;
    }

    const unlocked = await fillFirstVisible(
      page,
      ['[data-testid="unlock-password"]', 'input[type="password"]'],
      password,
    );
    if (unlocked) {
      await clickFirstVisible(page, [
        '[data-testid="unlock-submit"]',
        'button:has-text("Unlock")',
      ]);
      if (await waitForWalletReady(page)) {
        log('Wallet profile already initialized and unlocked.');
        return;
      }
    }

    await clickFirstVisible(
      page,
      ['[data-testid="onboarding-terms-checkbox"]', 'input[type="checkbox"]'],
      4000,
    );
    await clickFirstVisible(
      page,
      [
        '[data-testid="onboarding-get-started"]',
        'button:has-text("Get started")',
        'button:has-text("Get Started")',
        'button:has-text("Start")',
      ],
      8000,
    );

    let selectedExistingWallet = await clickFirstVisible(
      page,
      [
        '[data-testid="onboarding-import-wallet"]',
        'button:has-text("I have an existing wallet")',
        'button:has-text("Import wallet")',
        'button:has-text("Import an existing wallet")',
      ],
      12000,
    );
    if (!selectedExistingWallet) {
      await clickFirstVisible(
        page,
        [
          '[data-testid="onboarding-get-started"]',
          'button:has-text("Get started")',
          'button:has-text("Get Started")',
        ],
        8000,
      );
      selectedExistingWallet = await clickFirstVisible(
        page,
        [
          '[data-testid="onboarding-import-wallet"]',
          'button:has-text("I have an existing wallet")',
          'button:has-text("Import wallet")',
          'button:has-text("Import an existing wallet")',
        ],
        12000,
      );
    }
    await clickFirstVisible(
      page,
      [
        '[data-testid="metametrics-no-thanks"]',
        'button:has-text("No thanks")',
        'button:has-text("I agree")',
      ],
      4000,
    );
    await clickFirstVisible(
      page,
      [
        '[data-testid="onboarding-import-with-srp"]',
        '[data-testid="onboarding-import-srp"]',
        '[data-testid="import-srp"]',
        'button:has-text("Import using Secret Recovery Phrase")',
        'button:has-text("Import Secret Recovery Phrase")',
        'button:has-text("Secret Recovery Phrase")',
        'text=/Secret Recovery Phrase/i',
      ],
      12000,
    );
    await clickFirstVisible(
      page,
      [
        '[data-testid="metametrics-no-thanks"]',
        'button:has-text("No thanks")',
        'button:has-text("I agree")',
      ],
      4000,
    );

    let phraseFilled = await fillRecoveryPhrase(page, mnemonic);
    if (!phraseFilled) {
      // Retry onboarding branch once if UI was still transitioning from splash/welcome.
      await clickFirstVisible(
        page,
        [
          '[data-testid="onboarding-import-wallet"]',
          'button:has-text("I have an existing wallet")',
          'button:has-text("Import wallet")',
          'button:has-text("Import an existing wallet")',
        ],
        10000,
      );
      await clickFirstVisible(
        page,
        [
          '[data-testid="onboarding-import-with-srp"]',
          '[data-testid="onboarding-import-srp"]',
          '[data-testid="import-srp"]',
          'button:has-text("Import using Secret Recovery Phrase")',
          'button:has-text("Import Secret Recovery Phrase")',
          'button:has-text("Secret Recovery Phrase")',
          'text=/Secret Recovery Phrase/i',
        ],
        10000,
      );
      phraseFilled = await fillRecoveryPhrase(page, mnemonic);
    }
    if (!phraseFilled) {
      await dumpPageState(page, 'srp-not-found');
      await page
        .screenshot({
          path: path.resolve(
            process.cwd(),
            `tmp/metamask-srp-not-found-${Date.now()}.png`,
          ),
          fullPage: true,
        })
        .catch(() => {});
      throw new Error(
        'Unable to locate recovery phrase inputs on onboarding flow.',
      );
    }
    await clickFirstEnabled(
      page,
      ['[data-testid="import-srp-confirm"]', 'button:has-text("Continue")'],
      8000,
    );

    const passwordFilled = await fillFirstVisible(
      page,
      [
        '[data-testid="create-password-new"]',
        'input[id="password"]',
        'input[name="password"]',
      ],
      password,
    );
    const confirmPasswordFilled = await fillFirstVisible(
      page,
      [
        '[data-testid="create-password-confirm"]',
        'input[id="confirm-password"]',
        'input[name="confirm-password"]',
      ],
      password,
    );
    if (!passwordFilled || !confirmPasswordFilled) {
      const inputs = page.locator('input[type="password"]');
      const inputCount = await inputs.count();
      for (let index = 0; index < inputCount; index += 1) {
        const input = inputs.nth(index);
        const visible = await input
          .isVisible({ timeout: 500 })
          .catch(() => false);
        if (!visible) continue;
        await input.fill(password, { timeout: 3000 }).catch(() => {});
      }
    }

    await clickFirstVisible(page, [
      '[data-testid="create-password-terms"]',
      'input[type="checkbox"]',
    ]);

    const imported = await clickFirstEnabled(
      page,
      [
        '[data-testid="create-password-import"]',
        'button:has-text("Import my wallet")',
        'button:has-text("Import")',
        'button:has-text("Restore")',
        'button:has-text("Create password")',
        'button:has-text("Create Password")',
        'button:has-text("Continue")',
      ],
      12000,
    );
    if (!imported && !(await waitForWalletReady(page))) {
      await dumpPageState(page, 'create-password-submit-not-found');
      await page
        .screenshot({
          path: path.resolve(
            process.cwd(),
            `tmp/metamask-create-password-submit-not-found-${Date.now()}.png`,
          ),
          fullPage: true,
        })
        .catch(() => {});
      throw new Error(
        'Unable to submit wallet import/create step during onboarding.',
      );
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const advanced = await clickFirstEnabled(
        page,
        [
          '[data-testid="metametrics-no-thanks"]',
          '[data-testid="metametrics-i-agree"]',
          '[data-testid="onboarding-complete-done"]',
          '[data-testid="pin-extension-next"]',
          '[data-testid="pin-extension-done"]',
          'button:has-text("No thanks")',
          'button:has-text("No Thanks")',
          'button:has-text("I agree")',
          'button:has-text("Next")',
          'button:has-text("Done")',
          'button:has-text("Got it")',
          'button:has-text("Skip")',
        ],
        5000,
      );
      if (!advanced) break;
      await page.waitForTimeout(500);
    }

    if (!(await waitForWalletReady(page))) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await clickFirstEnabled(
          page,
          [
            '[data-testid="onboarding-complete-done"]',
            '[data-testid="pin-extension-next"]',
            '[data-testid="pin-extension-done"]',
            'button:has-text("Done")',
            'button:has-text("Next")',
            'button:has-text("Got it")',
            'button:has-text("Skip")',
            '[role="button"]:has-text("Done")',
            '[role="button"]:has-text("Next")',
            '[role="button"]:has-text("Got it")',
            '[role="button"]:has-text("Skip")',
          ],
          3000,
        ).catch(() => {});
        await page.waitForTimeout(300).catch(() => {});
      }

      if (page.isClosed()) {
        page = await context.newPage();
      }
      await page
        .goto(`${extensionHomeUrl}#/`, { waitUntil: 'domcontentloaded' })
        .catch(() => {});
      await page.waitForTimeout(1500).catch(() => {});

      if (!(await waitForWalletReady(page))) {
        const extensionPages = context
          .pages()
          .map((candidate) => candidate.url())
          .filter((url) =>
            url.startsWith(`chrome-extension://${extensionId}/`),
          );
        const hasOnboardingPage = extensionPages.some((url) =>
          url.includes('/onboarding/'),
        );
        const finalUrl = page.url();
        if (!finalUrl.includes('/onboarding/') && !hasOnboardingPage) {
          log(
            `Wallet onboarding completed but ready selectors were not detected (url=${finalUrl}). Proceeding.`,
          );
        } else {
          await dumpPageState(page, 'wallet-ready-not-detected');
          await page
            .screenshot({
              path: path.resolve(
                process.cwd(),
                `tmp/metamask-wallet-ready-not-detected-${Date.now()}.png`,
              ),
              fullPage: true,
            })
            .catch(() => {});
          throw new Error(
            `Wallet onboarding did not reach a ready state. Open extension pages: ${extensionPages.join(', ')}`,
          );
        }
      }
    }

    log('Wallet profile initialized and unlocked.');
  } finally {
    await context.close().catch(() => {});
  }
};

main().catch((error) => {
  console.error(
    `[wallet-bootstrap] fatal: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
  );
  process.exit(1);
});
