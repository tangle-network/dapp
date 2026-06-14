#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
  zeroAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';

const RPC_URL =
  process.env.LOCAL_STAKING_RPC_URL ||
  process.env.AGENT_WALLET_RPC_URL ||
  process.env.RPC_URL ||
  'http://127.0.0.1:8545';
const DAPP_URL =
  process.env.LOCAL_STAKING_DAPP_URL ||
  process.env.AGENT_WALLET_DAPP_URL ||
  'http://127.0.0.1:4200';
const EXPECTED_CHAIN_ID = 31337;
const WALLET_PASSWORD = process.env.AGENT_WALLET_PASSWORD ?? 'TangleLocal123!';
const WALLET_USER_DATA_DIR =
  process.env.AGENT_WALLET_USER_DATA_DIR ??
  path.resolve('.agent-wallet-profile-local-staking');
const RESET_WALLET_PROFILE =
  process.env.LOCAL_STAKING_UI_RESET_WALLET_PROFILE !== 'false';
const TARGET_LOCAL_BALANCE = parseEther(
  process.env.LOCAL_STAKING_UI_TARGET_BALANCE || '40',
);
const TARGET_HELPER_BALANCE = parseEther(
  process.env.LOCAL_STAKING_UI_HELPER_BALANCE || '5',
);

const DEFAULT_CONTRACTS = {
  multiAssetDelegation: '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
  rewardVaults: '0x0355b7b8cb128fa5692729ab3aaa199c1753f726',
};

const ADDRESS_CACHE_FILE =
  process.env.LOCAL_STAKING_ADDRESSES_FILE ||
  '/tmp/local-env-cache/addresses.env';
const DEPLOY_LOG_FILE =
  process.env.LOCAL_STAKING_DEPLOY_LOG || '/tmp/deploy.log';
const ADDRESS_PATTERN = '0x[a-fA-F0-9]{40}';

const PRIVATE_KEYS = {
  deployer:
    process.env.LOCAL_STAKING_DEPLOYER_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  operator:
    process.env.LOCAL_STAKING_OPERATOR_KEY ||
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  helper:
    process.env.LOCAL_STAKING_HELPER_KEY ||
    '0x1000000000000000000000000000000000000000000000000000000000000001',
};

const AMOUNTS = {
  deposit: parseEther(process.env.LOCAL_STAKING_UI_DEPOSIT || '0.33'),
  delegate: parseEther(process.env.LOCAL_STAKING_UI_DELEGATE || '0.21'),
  reward: parseEther(process.env.LOCAL_STAKING_UI_REWARD || '0.12'),
  undelegate: parseEther(process.env.LOCAL_STAKING_UI_UNDELEGATE || '0.05'),
  withdraw: parseEther(process.env.LOCAL_STAKING_UI_WITHDRAW || '0.03'),
};

const stakingAbi = [
  {
    name: 'currentRound',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'roundDuration',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'lastRoundAdvance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'delegationBondLessDelay',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'leaveDelegatorsDelay',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'getDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'delegator', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'delegatedAmount', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getDelegationMode',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'operator', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'canDelegate',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'delegator', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getPendingUnstakes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'delegator', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'operator', type: 'address' },
          {
            name: 'asset',
            type: 'tuple',
            components: [
              { name: 'kind', type: 'uint8' },
              { name: 'token', type: 'address' },
            ],
          },
          { name: 'shares', type: 'uint256' },
          { name: 'requestedRound', type: 'uint64' },
          { name: 'selectionMode', type: 'uint8' },
          { name: 'slashFactorSnapshot', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getPendingWithdrawals',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'delegator', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            components: [
              { name: 'kind', type: 'uint8' },
              { name: 'token', type: 'address' },
            ],
          },
          { name: 'amount', type: 'uint256' },
          { name: 'requestedRound', type: 'uint64' },
        ],
      },
    ],
  },
  {
    name: 'advanceRound',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
];

const rewardVaultsAbi = [
  {
    name: 'REWARDS_MANAGER_ROLE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'hasRole',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'grantRole',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'tntToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'getDelegatorPositions',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'delegator', type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'operator', type: 'address' },
          { name: 'stakedAmount', type: 'uint256' },
          { name: 'boostedScore', type: 'uint256' },
          { name: 'lockDuration', type: 'uint8' },
          { name: 'lockExpiry', type: 'uint256' },
          { name: 'pendingRewards', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'distributeRewards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'operator', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
];

const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
];

const log = (message) => console.log(`[local-staking-ui] ${message}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatError = (error) =>
  error?.shortMessage || error?.details || error?.message || String(error);
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const readTextIfExists = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
};

const parseAddressCache = () => {
  const text = readTextIfExists(ADDRESS_CACHE_FILE);
  const get = (key) =>
    text.match(new RegExp(`export ${key}="(${ADDRESS_PATTERN})"`, 'i'))?.[1];

  return {
    multiAssetDelegation: get('STAKING_PROXY'),
    rewardVaults: get('REWARD_VAULTS_ADDRESS'),
  };
};

const parseDeployLog = () => {
  const text = readTextIfExists(DEPLOY_LOG_FILE);
  const getLast = (label) =>
    [
      ...text.matchAll(new RegExp(`${label}:\\s*(${ADDRESS_PATTERN})`, 'gi')),
    ].at(-1)?.[1];

  return {
    multiAssetDelegation: getLast('MultiAssetDelegation'),
    rewardVaults: getLast('RewardVaults'),
  };
};

const resolveContracts = () => {
  const fromDeployLog = parseDeployLog();
  const fromCache = parseAddressCache();

  return {
    multiAssetDelegation:
      process.env.STAKING_ADDRESS ||
      fromDeployLog.multiAssetDelegation ||
      fromCache.multiAssetDelegation ||
      DEFAULT_CONTRACTS.multiAssetDelegation,
    rewardVaults:
      process.env.REWARD_VAULTS_ADDRESS ||
      fromDeployLog.rewardVaults ||
      fromCache.rewardVaults ||
      DEFAULT_CONTRACTS.rewardVaults,
  };
};

const CONTRACTS = resolveContracts();
const accounts = {
  deployer: privateKeyToAccount(PRIVATE_KEYS.deployer),
  operator: privateKeyToAccount(PRIVATE_KEYS.operator),
  helper: privateKeyToAccount(PRIVATE_KEYS.helper),
};

const publicClient = createPublicClient({
  chain: anvil,
  transport: http(RPC_URL),
});

const deployerWallet = createWalletClient({
  account: accounts.deployer,
  chain: anvil,
  transport: http(RPC_URL),
});

const helperWallet = createWalletClient({
  account: accounts.helper,
  chain: anvil,
  transport: http(RPC_URL),
});

const readStaking = (functionName, args = []) =>
  publicClient.readContract({
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName,
    args,
  });

const readRewardVaults = (functionName, args = []) =>
  publicClient.readContract({
    address: CONTRACTS.rewardVaults,
    abi: rewardVaultsAbi,
    functionName,
    args,
  });

const readErc20 = (token, functionName, args = []) =>
  publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName,
    args,
  });

const writeAs = async (wallet, label, request) => {
  const hash = await wallet.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  assert(receipt.status === 'success', `${label} reverted: ${hash}`);
  return hash;
};

const write = (label, request) => writeAs(deployerWallet, label, request);

const depositOf = async (delegator) => {
  const deposit = await readStaking('getDeposit', [delegator, zeroAddress]);

  return {
    amount: deposit.amount ?? deposit[0],
    delegatedAmount: deposit.delegatedAmount ?? deposit[1],
  };
};

const pendingRewardsForOperator = async (delegator, operator) => {
  const positions = await readRewardVaults('getDelegatorPositions', [
    zeroAddress,
    delegator,
  ]);
  const position = positions.find(
    (entry) =>
      (entry.operator ?? entry[0]).toLowerCase() === operator.toLowerCase(),
  );

  return position ? (position.pendingRewards ?? position[5]) : 0n;
};

const waitFor = async (label, predicate, timeoutMs = 120_000) => {
  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const value = await predicate();
      if (value) {
        return value;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(1_000);
  }

  throw new Error(
    `${label} did not complete within ${timeoutMs}ms${
      lastError ? `: ${formatError(lastError)}` : ''
    }`,
  );
};

const setNextBlockTimestamp = async (timestamp) => {
  await publicClient.request({
    method: 'evm_setNextBlockTimestamp',
    params: [Number(timestamp)],
  });
  await publicClient.request({ method: 'evm_mine', params: [] });
};

const advanceToRound = async (targetRound) => {
  let currentRound = await readStaking('currentRound');
  let attempts = 0;

  while (currentRound < targetRound) {
    attempts += 1;
    assert(attempts <= 256, `could not advance to round ${targetRound}`);

    const roundDuration = await readStaking('roundDuration');
    const lastRoundAdvance = await readStaking('lastRoundAdvance');
    const block = await publicClient.getBlock();
    const nextTimestamp =
      lastRoundAdvance === 0n
        ? block.timestamp + roundDuration + 1n
        : lastRoundAdvance + roundDuration + 1n;

    await setNextBlockTimestamp(
      nextTimestamp > block.timestamp ? nextTimestamp : block.timestamp + 1n,
    );
    await writeAs(helperWallet, `advance round to ${currentRound + 1n}`, {
      address: CONTRACTS.multiAssetDelegation,
      abi: stakingAbi,
      functionName: 'advanceRound',
      args: [],
    });

    currentRound = await readStaking('currentRound');
  }
};

const verifyLocalServices = async () => {
  const chainId = await publicClient.getChainId();
  assert(
    chainId === EXPECTED_CHAIN_ID,
    `expected chain ID ${EXPECTED_CHAIN_ID}, got ${chainId}`,
  );

  for (const [name, address] of Object.entries(CONTRACTS)) {
    const bytecode = await publicClient.getBytecode({ address });
    assert(bytecode, `missing code at ${name} ${address}`);
  }

  const dappResponse = await fetch(DAPP_URL, {
    signal: AbortSignal.timeout(10_000),
  });
  assert(
    dappResponse.ok,
    `dapp did not return 2xx at ${DAPP_URL}: ${dappResponse.status}`,
  );
};

const verifyOperatorFixture = async (delegator) => {
  const operatorMode = Number(
    await readStaking('getDelegationMode', [accounts.operator.address]),
  );
  const canDelegate = await readStaking('canDelegate', [
    accounts.operator.address,
    delegator,
  ]);

  assert(
    operatorMode === 2 && canDelegate,
    `operator ${accounts.operator.address} must be Open delegation mode`,
  );
};

const toQuantity = (value) => `0x${value.toString(16)}`;

const fundWallet = async (address) => {
  await publicClient.request({
    method: 'anvil_setBalance',
    params: [address, toQuantity(TARGET_LOCAL_BALANCE)],
  });

  const balance = await publicClient.getBalance({ address });
  assert(
    balance >= TARGET_LOCAL_BALANCE,
    `wallet ${address} has insufficient local ETH after funding`,
  );
};

const fundAccount = async (address, amount) => {
  await publicClient.request({
    method: 'anvil_setBalance',
    params: [address, toQuantity(amount)],
  });

  const balance = await publicClient.getBalance({ address });
  assert(
    balance >= amount,
    `account ${address} has insufficient local ETH after funding`,
  );
};

const prepareRewardHelper = async () => {
  await fundAccount(accounts.helper.address, TARGET_HELPER_BALANCE);

  const rewardsManagerRole = await readRewardVaults('REWARDS_MANAGER_ROLE');
  const helperHasRole = await readRewardVaults('hasRole', [
    rewardsManagerRole,
    accounts.helper.address,
  ]);

  if (!helperHasRole) {
    await write('grant helper reward-manager role', {
      address: CONTRACTS.rewardVaults,
      abi: rewardVaultsAbi,
      functionName: 'grantRole',
      args: [rewardsManagerRole, accounts.helper.address],
    });
  }

  const tntToken = await readRewardVaults('tntToken');
  const requiredVaultBalance = AMOUNTS.reward * 4n;
  const vaultBalance = await readErc20(tntToken, 'balanceOf', [
    CONTRACTS.rewardVaults,
  ]);

  if (vaultBalance < requiredVaultBalance) {
    await write('fund RewardVaults with TNT', {
      address: tntToken,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [CONTRACTS.rewardVaults, requiredVaultBalance - vaultBalance],
    });
  }
};

const loadAgentDriverModule = async () => {
  const candidates = [
    process.env.AGENT_BROWSER_DRIVER_MODULE,
    '@tangle-network/agent-browser-driver',
    pathToFileURL(path.resolve('../agent-browser-driver/dist/index.js')).href,
    pathToFileURL(path.resolve('../browser-agent-driver/dist/index.js')).href,
    pathToFileURL('/home/drew/code/browser-agent-driver/dist/index.js').href,
  ].filter(Boolean);
  const errors = [];

  for (const candidate of candidates) {
    try {
      return await import(candidate);
    } catch (error) {
      errors.push(`${candidate}: ${formatError(error)}`);
    }
  }

  throw new Error(
    [
      'Unable to load @tangle-network/agent-browser-driver.',
      ...errors.map((entry) => `- ${entry}`),
    ].join('\n'),
  );
};

const resolveExtensionPaths = () => {
  if (process.env.AGENT_WALLET_EXTENSION_PATHS) {
    return process.env.AGENT_WALLET_EXTENSION_PATHS.split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [
    ...new Set(
      [
        path.resolve('../agent-browser-driver/extensions/metamask'),
        path.resolve('../browser-agent-driver/extensions/metamask'),
        '/home/drew/code/browser-agent-driver/extensions/metamask',
      ].filter((candidate) => fs.existsSync(candidate)),
    ),
  ];
};

const resolveWalletOnboardingScript = () => {
  const candidates = [
    process.env.AGENT_WALLET_ONBOARDING_SCRIPT,
    path.resolve('../agent-browser-driver/bench/wallet/setup-onboarding.mjs'),
    path.resolve('../browser-agent-driver/bench/wallet/setup-onboarding.mjs'),
    '/home/drew/code/browser-agent-driver/bench/wallet/setup-onboarding.mjs',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};

const prepareWalletProfile = (extensionPath) => {
  if (!RESET_WALLET_PROFILE) {
    return;
  }

  const onboardingScript = resolveWalletOnboardingScript();
  assert(
    onboardingScript,
    'unable to reset wallet profile: MetaMask onboarding script not found',
  );

  const runOnboarding = (shouldReset) => {
    const args = [
      onboardingScript,
      '--profile',
      WALLET_USER_DATA_DIR,
      '--extension',
      extensionPath,
      '--password',
      WALLET_PASSWORD,
    ];

    if (shouldReset) {
      args.splice(1, 0, '--reset');
    }

    const result = spawnSync(process.execPath, args, {
      env: {
        ...process.env,
        PLAYWRIGHT_MODULE:
          process.env.PLAYWRIGHT_MODULE ??
          pathToFileURL(path.resolve('node_modules/playwright/index.js')).href,
      },
      stdio: 'inherit',
    });

    assert(
      result.status === 0,
      `wallet profile onboarding failed with exit code ${result.status}`,
    );
  };

  runOnboarding(true);
  runOnboarding(false);
};

const describeTestIdState = async (page, testId) => {
  const locator = page.getByTestId(testId);
  const count = await locator.count().catch(() => 0);
  const states = [];

  for (let index = 0; index < Math.min(count, 5); index += 1) {
    const candidate = locator.nth(index);
    const [visible, enabled, text, disabled, ariaDisabled, value] =
      await Promise.all([
        candidate.isVisible().catch(() => false),
        candidate.isEnabled().catch(() => false),
        candidate.innerText().catch(() => ''),
        candidate.getAttribute('disabled').catch(() => null),
        candidate.getAttribute('aria-disabled').catch(() => null),
        candidate.inputValue().catch(() => ''),
      ]);
    const rewardsState = await candidate
      .getAttribute('data-rewards-state')
      .catch(() => null);

    states.push({
      index,
      visible,
      enabled,
      text: text.trim().replace(/\s+/g, ' ').slice(0, 160),
      disabled,
      ariaDisabled,
      value,
      rewardsState,
    });
  }

  return {
    url: page.url(),
    count,
    states,
  };
};

const clickVisibleEnabled = async (page, testId, timeoutMs = 90_000) => {
  const locator = page.getByTestId(testId);
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      const visible = await candidate.isVisible().catch(() => false);
      const enabled = await candidate.isEnabled().catch(() => false);

      if (visible && enabled) {
        await candidate.click();
        return;
      }
    }

    await sleep(500);
  }

  const state = await describeTestIdState(page, testId);
  throw new Error(
    `timed out waiting for enabled [data-testid="${testId}"]: ${JSON.stringify(
      state,
    )}`,
  );
};

const closeOpenAppDialogs = async (page) => {
  const dialogs = page.locator('[role="dialog"][data-state="open"]');
  let closedAny = false;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const count = await dialogs.count().catch(() => 0);
    if (count === 0) {
      return closedAny;
    }

    closedAny = true;
    const closeButton = dialogs
      .first()
      .locator('button[aria-label="Close"], button:has-text("Close")')
      .first();
    const canClickClose =
      (await closeButton.isVisible().catch(() => false)) &&
      (await closeButton.isEnabled().catch(() => false));

    if (canClickClose) {
      await closeButton.click({ timeout: 1_500 }).catch(() => {});
    } else {
      await page.keyboard.press('Escape').catch(() => {});
    }

    await sleep(250);
  }

  return closedAny;
};

const fillVisible = async (page, testId, value, timeoutMs = 90_000) => {
  const locator = page.getByTestId(testId);
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      const visible = await candidate.isVisible().catch(() => false);
      const enabled = await candidate.isEnabled().catch(() => false);

      if (visible && enabled) {
        try {
          await candidate.click({ timeout: 2_000 });
        } catch (error) {
          const closedDialog = await closeOpenAppDialogs(page);
          if (closedDialog) {
            await sleep(500);
            continue;
          }

          throw error;
        }

        await candidate.fill('');
        await candidate.pressSequentially(value, { delay: 20 });
        await candidate.evaluate((element, nextValue) => {
          const prototype =
            element instanceof HTMLTextAreaElement
              ? HTMLTextAreaElement.prototype
              : HTMLInputElement.prototype;
          const descriptor = Object.getOwnPropertyDescriptor(
            prototype,
            'value',
          );
          descriptor?.set?.call(element, nextValue);
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
        await candidate.blur();
        await sleep(750);

        const currentValue = await candidate.inputValue().catch(() => '');
        if (currentValue === value) {
          return;
        }
      }
    }

    await sleep(500);
  }

  const state = await describeTestIdState(page, testId);
  throw new Error(
    `timed out waiting for input [data-testid="${testId}"]: ${JSON.stringify(
      state,
    )}`,
  );
};

const clickFirstVisibleModalItem = async (page, timeoutMs = 60_000) => {
  const started = Date.now();
  const items = page.locator('[role="dialog"] li');

  while (Date.now() - started < timeoutMs) {
    const count = await items.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = items.nth(index);
      const visible = await candidate.isVisible().catch(() => false);
      if (visible) {
        await candidate.click();
        return;
      }
    }

    await sleep(500);
  }

  throw new Error('timed out waiting for a selectable modal item');
};

const WALLET_PROMPT_FALLBACK_SELECTORS = [
  '[data-testid="unlock-submit"]',
  '[data-testid="page-container-footer-next"]',
  '[data-testid="page-container-footer-confirm"]',
  '[data-testid="confirmation-submit-button"]',
  '[data-testid="confirm-button"]',
  '[data-testid="confirm-btn"]',
  '[data-testid="confirm-footer-button"]',
  '[data-testid="request-signature__sign"]',
  '[data-testid="request-signature__sign-button"]',
  'button:has-text("Connect")',
  'button:has-text("Next")',
  'button:has-text("Continue")',
  'button:has-text("Approve")',
  'button:has-text("Confirm")',
  'button:has-text("Sign")',
  'button:has-text("Switch network")',
  'button:has-text("Switch Network")',
  'button:has-text("Add network")',
  'button:has-text("Add Network")',
];

const settleWalletPromptFallback = async (context, actionSelectors = []) => {
  const selectors = [
    ...new Set([...actionSelectors, ...WALLET_PROMPT_FALLBACK_SELECTORS]),
  ];

  for (const page of context.pages()) {
    if (page.isClosed() || !page.url().startsWith('chrome-extension://')) {
      continue;
    }

    const checkboxCount = await page
      .locator('input[type="checkbox"]')
      .count()
      .catch(() => 0);

    for (let index = 0; index < checkboxCount; index += 1) {
      const checkbox = page.locator('input[type="checkbox"]').nth(index);
      const visible = await checkbox.isVisible().catch(() => false);
      const checked = await checkbox.isChecked().catch(() => true);
      if (visible && !checked) {
        await checkbox.check({ force: true, timeout: 1_000 }).catch(() => {});
      }
    }

    for (const selector of selectors) {
      const locator = page.locator(selector);
      const count = await locator.count().catch(() => 0);

      for (let index = 0; index < count; index += 1) {
        const candidate = locator.nth(index);
        const visible = await candidate.isVisible().catch(() => false);
        const enabled = await candidate.isEnabled().catch(() => false);

        if (visible && enabled) {
          await candidate.click({ timeout: 1_500 }).catch(() => {});
          log(`[wallet] clicked ${selector} on ${page.url()}`);
          return true;
        }
      }
    }
  }

  return false;
};

const selectFirstModalResult = async (page, searchInputId, query) => {
  const input = page.locator(`#${searchInputId}`);
  try {
    await input.waitFor({ state: 'visible', timeout: 60_000 });
    await input.fill(query);
  } catch (error) {
    const dialogText = await page
      .locator('[role="dialog"][data-state="open"]')
      .first()
      .innerText({ timeout: 1_000 })
      .catch(() => '');
    log(
      `[modal] ${searchInputId} not visible; selecting first item without search. Dialog: ${dialogText
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 240)}`,
    );
  }

  await clickFirstVisibleModalItem(page);
};

const createPage = async (context) => {
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  page.on('pageerror', (error) => log(`[browser:error] ${error.message}`));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      log(`[browser:${message.type()}] ${message.text()}`);
    }
  });
  return page;
};

const goto = async (page, route) => {
  const url = new URL(route, DAPP_URL);
  await page.goto(url.href, { waitUntil: 'domcontentloaded' });
  await page
    .waitForLoadState('networkidle', { timeout: 10_000 })
    .catch(() => {});
};

const getConnectedWalletAddress = async (page) => {
  const accounts = await page
    .evaluate(() => globalThis.ethereum?.request({ method: 'eth_accounts' }))
    .catch(() => []);
  const address = Array.isArray(accounts) ? accounts[0] : undefined;

  assert(address, 'MetaMask preflight did not expose a connected account');
  return address;
};

const getEthereumAccounts = async (page) => {
  const accounts = await page
    .evaluate(() => globalThis.ethereum?.request({ method: 'eth_accounts' }))
    .catch(() => []);

  return Array.isArray(accounts) ? accounts : [];
};

const ensureWalletConnected = async (page) => {
  const existingAccounts = await getEthereumAccounts(page);
  if (existingAccounts.length > 0) {
    return existingAccounts[0];
  }

  await clickVisibleEnabled(page, 'evm-connect-trigger');
  const walletOption = page
    .locator('[data-testid^="evm-wallet-option-"]')
    .filter({ hasText: /MetaMask|Browser Wallet|Injected|Ethereum Wallet/i })
    .first();

  await walletOption.waitFor({ state: 'visible', timeout: 30_000 });
  await walletOption.click();

  const accounts = await waitFor(
    'wallet connect',
    async () => {
      const nextAccounts = await getEthereumAccounts(page);
      return nextAccounts.length > 0 ? nextAccounts : null;
    },
    90_000,
  );

  return accounts[0];
};

const ensureWalletChain = async (page) => {
  const targetChainId = `0x${EXPECTED_CHAIN_ID.toString(16)}`;
  await waitFor(
    'ethereum provider',
    async () => {
      return page
        .evaluate(() => Boolean(globalThis.ethereum))
        .catch(() => false);
    },
    30_000,
  );

  const currentChainId = await page
    .evaluate(() => globalThis.ethereum?.request({ method: 'eth_chainId' }))
    .catch(() => null);

  if (
    typeof currentChainId === 'string' &&
    currentChainId.toLowerCase() === targetChainId
  ) {
    return;
  }

  const requestWalletChain = () =>
    page.evaluate(
      async ({ chainId, rpcUrl }) => {
        const messageOf = (error) => error?.message || String(error);
        const codeOf = (error) => error?.code;

        try {
          await globalThis.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          });
          return { ok: true };
        } catch (error) {
          if (codeOf(error) !== 4902 && codeOf(error) !== -32002) {
            return {
              ok: false,
              message: messageOf(error),
            };
          }

          if (codeOf(error) === -32002) {
            return {
              ok: false,
              pending: true,
              message: messageOf(error),
            };
          }

          try {
            await globalThis.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId,
                  chainName: 'Tangle Local',
                  rpcUrls: [rpcUrl],
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
            return { ok: true };
          } catch (addError) {
            return {
              ok: false,
              pending: codeOf(addError) === -32002,
              message: messageOf(addError),
            };
          }
        }
      },
      { chainId: targetChainId, rpcUrl: RPC_URL },
    );

  let result = await requestWalletChain();
  let lastRequestAt = Date.now();
  if (!result.ok && !result.pending) {
    throw new Error(`wallet chain switch failed: ${result.message}`);
  }

  await waitFor(
    'wallet chain switch',
    async () => {
      const chainId = await page
        .evaluate(() => globalThis.ethereum?.request({ method: 'eth_chainId' }))
        .catch(() => null);

      if (
        typeof chainId === 'string' &&
        chainId.toLowerCase() === targetChainId
      ) {
        return true;
      }

      if (Date.now() - lastRequestAt > 5_000) {
        result = await requestWalletChain();
        lastRequestAt = Date.now();

        if (!result.ok && !result.pending) {
          throw new Error(`wallet chain switch failed: ${result.message}`);
        }
      }

      return false;
    },
    45_000,
  );
};

const run = async () => {
  await verifyLocalServices();

  const driverModule = await loadAgentDriverModule();
  const playwrightModule = await import('playwright');
  const { chromium } = playwrightModule;
  const {
    DEFAULT_PROMPT_PATHS,
    DEFAULT_WALLET_ACTION_SELECTORS,
    settleWalletPrompts,
    startWalletAutoApprover,
  } = driverModule;

  assert(
    typeof startWalletAutoApprover === 'function',
    'agent-browser-driver is missing wallet automation exports',
  );

  const extensionPaths = resolveExtensionPaths();
  assert(
    extensionPaths.length > 0,
    'MetaMask extension path not found for local staking UI gate',
  );

  await prepareRewardHelper();
  prepareWalletProfile(extensionPaths[0]);

  const extensionArgs =
    extensionPaths.length > 0
      ? [
          `--disable-extensions-except=${extensionPaths.join(',')}`,
          `--load-extension=${extensionPaths.join(',')}`,
        ]
      : [];

  fs.mkdirSync(WALLET_USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(WALLET_USER_DATA_DIR, {
    channel: 'chromium',
    headless: false,
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 1000 },
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      ...extensionArgs,
    ],
  });

  const actionSelectors = DEFAULT_WALLET_ACTION_SELECTORS;
  const promptPaths = DEFAULT_PROMPT_PATHS;
  const stopApprover = await startWalletAutoApprover(context, {
    password: WALLET_PASSWORD,
    actionSelectors,
    tickMs: 750,
    log: (message) => log(`[wallet] ${message}`),
  });

  let promptSettlerActive = true;
  let promptSettlerBusy = false;
  const promptSettler = setInterval(() => {
    if (!promptSettlerActive) {
      return;
    }

    settleWalletPromptFallback(context, actionSelectors).catch(() => {});

    if (!promptSettlerBusy && typeof settleWalletPrompts === 'function') {
      promptSettlerBusy = true;
      settleWalletPrompts(context, {
        password: WALLET_PASSWORD,
        actionSelectors,
        promptPaths,
        log: (message) => log(`[wallet] ${message}`),
      })
        .catch(() => {})
        .finally(() => {
          promptSettlerBusy = false;
        });
    }
  }, 750);

  const steps = [];

  try {
    const page = await createPage(context);
    await goto(page, '/staking/deposit');
    await ensureWalletConnected(page);
    await ensureWalletChain(page);
    await closeOpenAppDialogs(page);
    const walletAddress = await getConnectedWalletAddress(page);
    await fundWallet(walletAddress);
    await verifyOperatorFixture(walletAddress);

    log(`Connected wallet: ${walletAddress}`);
    log(`Operator: ${accounts.operator.address}`);

    const beforeDeposit = await depositOf(walletAddress);
    await goto(page, `/staking/deposit?assetId=${zeroAddress}`);
    await closeOpenAppDialogs(page);
    await fillVisible(
      page,
      'staking-deposit-amount-input',
      formatEther(AMOUNTS.deposit),
    );
    await clickVisibleEnabled(page, 'staking-deposit-submit');
    await waitFor('deposit via dapp', async () => {
      const after = await depositOf(walletAddress);
      return after.amount >= beforeDeposit.amount + AMOUNTS.deposit;
    });
    steps.push({
      action: 'deposit',
      result: `${formatEther(AMOUNTS.deposit)} ETH`,
    });

    const beforeDelegate = await depositOf(walletAddress);
    await goto(page, `/staking/delegate?operator=${accounts.operator.address}`);
    await closeOpenAppDialogs(page);
    await clickVisibleEnabled(page, 'staking-delegate-asset-selector');
    await selectFirstModalResult(page, 'staking-delegate-asset-search', 'ETH');
    await fillVisible(
      page,
      'staking-delegate-amount-input',
      formatEther(AMOUNTS.delegate),
    );
    await clickVisibleEnabled(page, 'staking-delegate-submit');
    await waitFor('delegate via dapp', async () => {
      const after = await depositOf(walletAddress);
      return (
        after.delegatedAmount >=
        beforeDelegate.delegatedAmount + AMOUNTS.delegate
      );
    });
    steps.push({
      action: 'delegate',
      result: `${formatEther(AMOUNTS.delegate)} ETH`,
    });

    const tntToken = await readRewardVaults('tntToken');
    await writeAs(helperWallet, 'distribute native staking rewards', {
      address: CONTRACTS.rewardVaults,
      abi: rewardVaultsAbi,
      functionName: 'distributeRewards',
      args: [zeroAddress, accounts.operator.address, AMOUNTS.reward],
    });
    await waitFor('pending rewards after distribution', async () => {
      return (
        (await pendingRewardsForOperator(
          walletAddress,
          accounts.operator.address,
        )) > 0n
      );
    });

    const beforeClaimTnt = await readErc20(tntToken, 'balanceOf', [
      walletAddress,
    ]);
    await goto(page, '/staking/rewards');
    await closeOpenAppDialogs(page);
    await clickVisibleEnabled(page, 'staking-claim-rewards-submit');
    await waitFor('claim rewards via dapp', async () => {
      const afterClaimTnt = await readErc20(tntToken, 'balanceOf', [
        walletAddress,
      ]);
      return afterClaimTnt > beforeClaimTnt;
    });
    steps.push({ action: 'claim rewards', result: 'TNT balance increased' });

    const unstakesBefore = await readStaking('getPendingUnstakes', [
      walletAddress,
    ]);
    await goto(page, '/staking/undelegate');
    await closeOpenAppDialogs(page);
    await clickVisibleEnabled(page, 'staking-undelegate-delegation-selector');
    await selectFirstModalResult(
      page,
      'staking-undelegate-delegation-search',
      accounts.operator.address,
    );
    await fillVisible(
      page,
      'staking-undelegate-amount-input',
      formatEther(AMOUNTS.undelegate),
    );
    const unstakeRound = await readStaking('currentRound');
    await clickVisibleEnabled(page, 'staking-undelegate-submit');
    const unstakesScheduled = await waitFor(
      'schedule undelegate via dapp',
      async () => {
        const pending = await readStaking('getPendingUnstakes', [
          walletAddress,
        ]);
        return pending.length > unstakesBefore.length ? pending : null;
      },
    );
    steps.push({
      action: 'schedule undelegate',
      result: `${formatEther(AMOUNTS.undelegate)} ETH`,
    });

    const unstakeDelay = await readStaking('delegationBondLessDelay');
    const beforeExecuteUnstake = await depositOf(walletAddress);
    await advanceToRound(unstakeRound + unstakeDelay);
    await goto(page, '/staking/undelegate');
    await closeOpenAppDialogs(page);
    await clickVisibleEnabled(page, 'staking-undelegate-requests-toggle');
    await clickVisibleEnabled(page, 'staking-undelegate-execute-ready');
    await waitFor('execute undelegate via dapp', async () => {
      const after = await depositOf(walletAddress);
      const pending = await readStaking('getPendingUnstakes', [walletAddress]);
      return (
        after.delegatedAmount < beforeExecuteUnstake.delegatedAmount &&
        pending.length < unstakesScheduled.length
      );
    });
    steps.push({
      action: 'execute undelegate',
      result: 'delegated balance reduced',
    });

    const withdrawalsBefore = await readStaking('getPendingWithdrawals', [
      walletAddress,
    ]);
    await goto(page, '/staking/withdraw');
    await closeOpenAppDialogs(page);
    await clickVisibleEnabled(page, 'staking-withdraw-asset-selector');
    await selectFirstModalResult(page, 'staking-withdraw-asset-search', 'ETH');
    await fillVisible(
      page,
      'staking-withdraw-amount-input',
      formatEther(AMOUNTS.withdraw),
    );
    const withdrawRound = await readStaking('currentRound');
    await clickVisibleEnabled(page, 'staking-withdraw-submit');
    const withdrawalsScheduled = await waitFor(
      'schedule withdraw via dapp',
      async () => {
        const pending = await readStaking('getPendingWithdrawals', [
          walletAddress,
        ]);
        return pending.length > withdrawalsBefore.length ? pending : null;
      },
    );
    steps.push({
      action: 'schedule withdraw',
      result: `${formatEther(AMOUNTS.withdraw)} ETH`,
    });

    const withdrawalDelay = await readStaking('leaveDelegatorsDelay');
    await advanceToRound(withdrawRound + withdrawalDelay);
    await goto(page, '/staking/withdraw');
    await closeOpenAppDialogs(page);
    await clickVisibleEnabled(page, 'staking-withdraw-requests-toggle');
    await clickVisibleEnabled(page, 'staking-withdraw-execute-ready');
    await waitFor('execute withdraw via dapp', async () => {
      const pending = await readStaking('getPendingWithdrawals', [
        walletAddress,
      ]);
      return pending.length < withdrawalsScheduled.length;
    });
    steps.push({
      action: 'execute withdraw',
      result: 'pending withdrawal cleared',
    });

    console.log('\nLocal staking dapp gate passed.');
    console.log(`Dapp: ${DAPP_URL}`);
    console.log(`RPC: ${RPC_URL}`);
    console.log(`Wallet: ${walletAddress}`);
    console.log(`MultiAssetDelegation: ${CONTRACTS.multiAssetDelegation}`);
    console.log(`RewardVaults: ${CONTRACTS.rewardVaults}`);
    console.table(steps);
  } finally {
    promptSettlerActive = false;
    clearInterval(promptSettler);
    stopApprover?.();
    await context.close().catch(() => {});
  }
};

run().catch((error) => {
  console.error(`\nLocal staking dapp gate failed: ${formatError(error)}`);
  process.exitCode = 1;
});
