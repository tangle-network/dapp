#!/usr/bin/env node
/**
 * Continuous Activity Generator for Leaderboard Testing
 *
 * This script generates random blockchain activity at regular intervals
 * to simulate real-world usage patterns for the leaderboard.
 *
 * Activities generated:
 * - Deposits (native ETH and ERC20 tokens)
 * - Delegations to operators (native and ERC20)
 * - Operator discovery from the seeded local deployment
 * - Blueprint creations
 * - Service requests and activations
 * - Job submissions
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  parseUnits,
  encodeFunctionData,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';
import { randomInt, randomUUID } from 'node:crypto';

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const ACTIVITY_INTERVAL_MS = parseInt(
  process.env.ACTIVITY_INTERVAL_MS || '10000',
); // 10 seconds default

// Contract addresses (deterministic from Anvil)
const CONTRACTS = {
  tangle:
    process.env.TANGLE_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  multiAssetDelegation:
    process.env.STAKING_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  statusRegistry:
    process.env.STATUS_REGISTRY_ADDRESS ||
    '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
};

const SEEDED_OPERATOR_ACCOUNT_INDICES = [1, 2, 3];

// Tangle contract ABI fragments for blueprints/services/jobs
const TANGLE_ABI = [
  {
    name: 'submitJob',
    type: 'function',
    inputs: [
      { name: 'serviceId', type: 'uint64' },
      { name: 'jobIndex', type: 'uint8' },
      { name: 'inputs', type: 'bytes' },
    ],
    outputs: [{ name: 'callId', type: 'uint64' }],
    stateMutability: 'payable',
  },
  {
    name: 'serviceCount',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    name: 'isServiceActive',
    type: 'function',
    inputs: [{ name: 'serviceId', type: 'uint64' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    name: 'isPermittedCaller',
    type: 'function',
    inputs: [
      { name: 'serviceId', type: 'uint64' },
      { name: 'caller', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    name: 'addPermittedCaller',
    type: 'function',
    inputs: [
      { name: 'serviceId', type: 'uint64' },
      { name: 'caller', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'getService',
    type: 'function',
    inputs: [{ name: 'serviceId', type: 'uint64' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'blueprintId', type: 'uint64' },
          { name: 'owner', type: 'address' },
          { name: 'ttl', type: 'uint64' },
          { name: 'activatedAt', type: 'uint64' },
          { name: 'totalOperators', type: 'uint8' },
          { name: 'totalExposure', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
];

// Mock token addresses (set via env vars or will be detected)
const TOKENS = {
  usdc: { address: process.env.USDC_ADDRESS, decimals: 6, symbol: 'USDC' },
  usdt: { address: process.env.USDT_ADDRESS, decimals: 6, symbol: 'USDT' },
  dai: { address: process.env.DAI_ADDRESS, decimals: 18, symbol: 'DAI' },
  weth: { address: process.env.WETH_ADDRESS, decimals: 18, symbol: 'WETH' },
  stETH: { address: process.env.STETH_ADDRESS, decimals: 18, symbol: 'stETH' },
  wstETH: {
    address: process.env.WSTETH_ADDRESS,
    decimals: 18,
    symbol: 'wstETH',
  },
  eigen: { address: process.env.EIGEN_ADDRESS, decimals: 18, symbol: 'EIGEN' },
};

// Anvil default accounts (first 10)
const ANVIL_ACCOUNTS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
];

// ABI fragments
const MULTI_ASSET_DELEGATION_ABI = [
  {
    name: 'deposit',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    name: 'depositERC20',
    type: 'function',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'delegate',
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'delegateWithOptions',
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'selectionMode', type: 'uint8' },
      { name: 'blueprintIds', type: 'uint64[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'isOperator',
    type: 'function',
    inputs: [{ name: 'operator', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    name: 'getDelegationMode',
    type: 'function',
    inputs: [{ name: 'operator', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'getDeposit',
    type: 'function',
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
    stateMutability: 'view',
  },
];

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
];

// State tracking
const state = {
  operators: [],
  delegators: [],
  erc20Depositors: {}, // { tokenKey: [accountIndex, ...] }
  blueprintIds: [0n], // Default blueprint from LocalTestnet setup
  serviceIds: [], // Will be populated from chain
  activeServiceIds: [], // Services that are active and can receive jobs
  jobCallCount: 0,
  activityCount: 0,
  tokensAvailable: [], // Token keys that have addresses
};

// Chain ID - use 31337 (Anvil default) to match config.local.yaml
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '31337');

// Clients
const publicClient = createPublicClient({
  chain: { ...anvil, id: CHAIN_ID },
  transport: http(RPC_URL),
});

const getWalletClient = (privateKey) => {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: { ...anvil, id: CHAIN_ID },
    transport: http(RPC_URL),
  });
};

// Utility functions
const randomFloat = () => randomInt(0, 1_000_000_000) / 1_000_000_000;
const randomChoice = (arr) => arr[randomInt(arr.length)];
const randomAmount = (min, max) =>
  parseEther(String(min + randomFloat() * (max - min)));
const randomTokenAmount = (min, max, decimals) =>
  parseUnits(String(min + randomFloat() * (max - min)), decimals);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Activity generators
async function depositNativeToken(accountIndex) {
  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const amount = randomAmount(0.1, 2);

  console.log(
    `[DEPOSIT_ETH] Account ${accountIndex} depositing ${Number(amount) / 1e18} ETH`,
  );

  try {
    const hash = await walletClient.sendTransaction({
      to: CONTRACTS.multiAssetDelegation,
      value: amount,
      data: encodeFunctionData({
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'deposit',
        args: [],
      }),
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[DEPOSIT_ETH] Success: ${hash}`);

    if (!state.delegators.includes(accountIndex)) {
      state.delegators.push(accountIndex);
    }

    return true;
  } catch (error) {
    console.error(`[DEPOSIT_ETH] Failed:`, error.message);
    return false;
  }
}

async function depositERC20Token(accountIndex, tokenKey) {
  const token = TOKENS[tokenKey];
  if (!token || !token.address) {
    console.log(`[DEPOSIT_ERC20] Token ${tokenKey} not available`);
    return false;
  }

  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const account = privateKeyToAccount(privateKey);

  // Random amount based on token type
  let minAmount, maxAmount;
  if (tokenKey === 'usdc' || tokenKey === 'usdt') {
    minAmount = 100;
    maxAmount = 10000; // 100-10k stablecoins
  } else if (tokenKey === 'dai') {
    minAmount = 100;
    maxAmount = 10000;
  } else if (
    tokenKey === 'weth' ||
    tokenKey === 'stETH' ||
    tokenKey === 'wstETH'
  ) {
    minAmount = 0.1;
    maxAmount = 5;
  } else if (tokenKey === 'eigen') {
    minAmount = 10;
    maxAmount = 500;
  } else {
    minAmount = 1;
    maxAmount = 100;
  }

  const amount = randomTokenAmount(minAmount, maxAmount, token.decimals);
  const amountFormatted = Number(amount) / 10 ** token.decimals;

  console.log(
    `[DEPOSIT_ERC20] Account ${accountIndex} depositing ${amountFormatted} ${token.symbol}`,
  );

  try {
    // Check balance first
    const balance = await publicClient.readContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    if (balance < amount) {
      console.log(
        `[DEPOSIT_ERC20] Insufficient ${token.symbol} balance: ${Number(balance) / 10 ** token.decimals}`,
      );
      return false;
    }

    // Check and set allowance
    const allowance = await publicClient.readContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account.address, CONTRACTS.multiAssetDelegation],
    });

    if (allowance < amount) {
      console.log(`[DEPOSIT_ERC20] Approving ${token.symbol}...`);
      const approveHash = await walletClient.writeContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [
          CONTRACTS.multiAssetDelegation,
          BigInt(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ),
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }

    // Deposit
    const hash = await walletClient.writeContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'depositERC20',
      args: [token.address, amount],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[DEPOSIT_ERC20] Success: ${hash}`);

    // Track depositors per token
    if (!state.erc20Depositors[tokenKey]) {
      state.erc20Depositors[tokenKey] = [];
    }
    if (!state.erc20Depositors[tokenKey].includes(accountIndex)) {
      state.erc20Depositors[tokenKey].push(accountIndex);
    }

    return true;
  } catch (error) {
    console.error(`[DEPOSIT_ERC20] Failed:`, error.message);
    return false;
  }
}

async function delegateNativeToOperator(accountIndex) {
  if (state.operators.length === 0) {
    console.log('[DELEGATE_ETH] No operators available');
    return false;
  }

  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const account = privateKeyToAccount(privateKey);
  const operatorIndex = randomChoice(state.operators);
  const operatorAccount = privateKeyToAccount(ANVIL_ACCOUNTS[operatorIndex]);

  try {
    const deposit = await publicClient.readContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'getDeposit',
      args: [account.address, '0x0000000000000000000000000000000000000000'],
    });

    const available = deposit.amount - deposit.delegatedAmount;
    if (available <= 0n) {
      console.log(
        `[DELEGATE_ETH] Account ${accountIndex} has no available ETH balance`,
      );
      return false;
    }

    const percentage = 0.1 + randomFloat() * 0.4;
    const amount = BigInt(Math.floor(Number(available) * percentage));

    if (amount < parseEther('0.01')) {
      console.log(
        `[DELEGATE_ETH] Account ${accountIndex} available balance too low`,
      );
      return false;
    }

    console.log(
      `[DELEGATE_ETH] Account ${accountIndex} delegating ${Number(amount) / 1e18} ETH to operator ${operatorIndex}`,
    );

    const hash = await walletClient.writeContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'delegate',
      args: [operatorAccount.address, amount],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[DELEGATE_ETH] Success: ${hash}`);
    return true;
  } catch (error) {
    console.error(`[DELEGATE_ETH] Failed:`, error.message);
    return false;
  }
}

async function delegateERC20ToOperator(accountIndex, tokenKey) {
  if (state.operators.length === 0) {
    console.log('[DELEGATE_ERC20] No operators available');
    return false;
  }

  const token = TOKENS[tokenKey];
  if (!token || !token.address) {
    console.log(`[DELEGATE_ERC20] Token ${tokenKey} not available`);
    return false;
  }

  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const account = privateKeyToAccount(privateKey);
  const operatorIndex = randomChoice(state.operators);
  const operatorAccount = privateKeyToAccount(ANVIL_ACCOUNTS[operatorIndex]);

  try {
    const deposit = await publicClient.readContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'getDeposit',
      args: [account.address, token.address],
    });

    const available = deposit.amount - deposit.delegatedAmount;
    if (available <= 0n) {
      console.log(
        `[DELEGATE_ERC20] Account ${accountIndex} has no available ${token.symbol} balance`,
      );
      return false;
    }

    const percentage = 0.1 + randomFloat() * 0.4;
    const amount = BigInt(Math.floor(Number(available) * percentage));

    const minAmount = parseUnits('1', token.decimals);
    if (amount < minAmount) {
      console.log(
        `[DELEGATE_ERC20] Account ${accountIndex} available ${token.symbol} balance too low`,
      );
      return false;
    }

    const amountFormatted = Number(amount) / 10 ** token.decimals;
    console.log(
      `[DELEGATE_ERC20] Account ${accountIndex} delegating ${amountFormatted} ${token.symbol} to operator ${operatorIndex}`,
    );

    const hash = await walletClient.writeContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'delegateWithOptions',
      args: [operatorAccount.address, token.address, amount, 0, []], // 0 = BlueprintSelectionMode.All
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[DELEGATE_ERC20] Success: ${hash}`);
    return true;
  } catch (error) {
    console.error(`[DELEGATE_ERC20] Failed:`, error.message);
    return false;
  }
}

async function discoverSeededOperator(accountIndex) {
  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const account = privateKeyToAccount(privateKey);

  try {
    const isOperator = await publicClient.readContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'isOperator',
      args: [account.address],
    });

    if (!isOperator) {
      console.log(
        `[DISCOVER_OPERATOR] Account ${accountIndex} is not a registered local operator`,
      );
      return false;
    }

    const delegationMode = await publicClient.readContract({
      address: CONTRACTS.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'getDelegationMode',
      args: [account.address],
    });
    const modeName =
      ['Disabled', 'Whitelist', 'Open'][Number(delegationMode)] ||
      `Unknown(${delegationMode})`;

    console.log(
      `[DISCOVER_OPERATOR] Account ${accountIndex} registered, delegation mode: ${modeName}`,
    );

    if (Number(delegationMode) !== 2) {
      console.log(
        `[DISCOVER_OPERATOR] Account ${accountIndex} is not a public delegation target, skipping random delegation traffic`,
      );
      return true;
    }

    if (!state.operators.includes(accountIndex)) {
      state.operators.push(accountIndex);
    }

    return true;
  } catch (error) {
    console.error(
      `[DISCOVER_OPERATOR] Failed for account ${accountIndex}:`,
      error.message,
    );
    return false;
  }
}

async function submitJob(accountIndex) {
  if (state.activeServiceIds.length === 0) {
    console.log('[SUBMIT_JOB] No active services available');
    return false;
  }

  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const account = privateKeyToAccount(privateKey);
  const serviceId = randomChoice(state.activeServiceIds);

  console.log(
    `[SUBMIT_JOB] Account ${accountIndex} submitting job to service ${serviceId}`,
  );

  try {
    // Check if caller is permitted (deployer/owner should be permitted by default)
    const isPermitted = await publicClient.readContract({
      address: CONTRACTS.tangle,
      abi: TANGLE_ABI,
      functionName: 'isPermittedCaller',
      args: [serviceId, account.address],
    });

    // If not permitted and account is deployer (index 0), try anyway - they might be the owner
    if (!isPermitted && accountIndex !== 0) {
      console.log(
        `[SUBMIT_JOB] Account ${accountIndex} is not a permitted caller for service ${serviceId}`,
      );
      return false;
    }

    // Generate random job inputs
    const jobIndex = 0; // First job defined in blueprint
    const inputData = `0x${Buffer.from(
      JSON.stringify({
        timestamp: Date.now(),
        caller: account.address,
        random: randomUUID().replace(/-/g, '').slice(0, 7),
      }),
    ).toString('hex')}`;

    const hash = await walletClient.writeContract({
      address: CONTRACTS.tangle,
      abi: TANGLE_ABI,
      functionName: 'submitJob',
      args: [serviceId, jobIndex, inputData],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[SUBMIT_JOB] Success: ${hash}`);
    state.jobCallCount++;
    return true;
  } catch (error) {
    console.error(`[SUBMIT_JOB] Failed:`, error.message);
    return false;
  }
}

async function discoverServices() {
  console.log('[DISCOVER_SERVICES] Looking for active services...');

  try {
    const serviceCount = await publicClient.readContract({
      address: CONTRACTS.tangle,
      abi: TANGLE_ABI,
      functionName: 'serviceCount',
    });

    console.log(`[DISCOVER_SERVICES] Total service count: ${serviceCount}`);

    // Check each service ID to see if it's active
    for (let i = 0n; i < serviceCount; i++) {
      try {
        const isActive = await publicClient.readContract({
          address: CONTRACTS.tangle,
          abi: TANGLE_ABI,
          functionName: 'isServiceActive',
          args: [i],
        });

        if (isActive && !state.activeServiceIds.includes(i)) {
          state.activeServiceIds.push(i);
          console.log(`[DISCOVER_SERVICES] Found active service: ${i}`);
        }
      } catch {
        // Service might not exist yet
      }
    }

    console.log(
      `[DISCOVER_SERVICES] Active services: ${state.activeServiceIds.length}`,
    );
  } catch (error) {
    console.log(
      `[DISCOVER_SERVICES] Failed to discover services:`,
      error.message,
    );
  }
}

// Main activity loop
async function runActivityCycle() {
  state.activityCount++;
  console.log(`\n=== Activity Cycle ${state.activityCount} ===`);

  // Activity types with weights
  const activityTypes = [
    { name: 'depositETH', weight: 20 },
    { name: 'depositERC20', weight: 30 },
    { name: 'delegateETH', weight: 15 },
    { name: 'delegateERC20', weight: 20 },
    { name: 'multiDeposit', weight: 10 },
    { name: 'submitJob', weight: 15 },
  ];

  // Filter out activities based on availability
  const availableActivities = activityTypes.filter((a) => {
    if (
      (a.name === 'depositERC20' || a.name === 'delegateERC20') &&
      state.tokensAvailable.length === 0
    ) {
      return false;
    }
    if (a.name === 'submitJob' && state.activeServiceIds.length === 0) {
      return false;
    }
    return true;
  });

  const totalWeight = availableActivities.reduce((sum, a) => sum + a.weight, 0);
  let random = randomFloat() * totalWeight;
  let selectedActivity = availableActivities[0].name;

  for (const activity of availableActivities) {
    random -= activity.weight;
    if (random <= 0) {
      selectedActivity = activity.name;
      break;
    }
  }

  // Pick random account (skip account 0 which is the deployer)
  const accountIndex = 1 + randomInt(ANVIL_ACCOUNTS.length - 1);

  switch (selectedActivity) {
    case 'depositETH':
      await depositNativeToken(accountIndex);
      break;

    case 'depositERC20': {
      const tokenKey = randomChoice(state.tokensAvailable);
      await depositERC20Token(accountIndex, tokenKey);
      break;
    }

    case 'delegateETH':
      if (!state.delegators.includes(accountIndex)) {
        await depositNativeToken(accountIndex);
        await sleep(2000);
      }
      await delegateNativeToOperator(accountIndex);
      break;

    case 'delegateERC20': {
      const tokenKey = randomChoice(state.tokensAvailable);
      const depositors = state.erc20Depositors[tokenKey] || [];
      if (depositors.length === 0 || !depositors.includes(accountIndex)) {
        await depositERC20Token(accountIndex, tokenKey);
        await sleep(2000);
      }
      await delegateERC20ToOperator(accountIndex, tokenKey);
      break;
    }

    case 'multiDeposit': {
      // Generate 3 random accounts, then deduplicate to prevent nonce collisions
      const rawAccounts = [1, 2, 3].map(
        () => 1 + randomInt(ANVIL_ACCOUNTS.length - 1),
      );
      const uniqueAccounts = [...new Set(rawAccounts)];

      // Mix of ETH and ERC20 deposits - each unique account processes sequentially
      await Promise.all(
        uniqueAccounts.map(async (idx) => {
          if (randomFloat() > 0.5 && state.tokensAvailable.length > 0) {
            const tokenKey = randomChoice(state.tokensAvailable);
            return depositERC20Token(idx, tokenKey);
          } else {
            return depositNativeToken(idx);
          }
        }),
      );
      break;
    }

    case 'submitJob':
      // Use deployer (account 0) or service owner for job submission
      // since they have permission by default
      await submitJob(0);
      break;
  }

  console.log(
    `\nState: ${state.operators.length} operators, ${state.delegators.length} ETH delegators`,
  );
  console.log(
    `ERC20 depositors: ${
      Object.entries(state.erc20Depositors)
        .map(([k, v]) => `${k}:${v.length}`)
        .join(', ') || 'none'
    }`,
  );
  console.log(
    `Services: ${state.activeServiceIds.length} active, Jobs submitted: ${state.jobCallCount}`,
  );
}

// Detect available tokens by checking if addresses return valid symbol
async function detectTokens() {
  console.log('\nDetecting available tokens...');

  for (const [key, token] of Object.entries(TOKENS)) {
    if (!token.address) continue;

    try {
      const symbol = await publicClient.readContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'symbol',
      });
      console.log(`  Found ${symbol} at ${token.address}`);
      state.tokensAvailable.push(key);
    } catch {
      console.log(`  Token ${key} at ${token.address} not available`);
    }
  }

  console.log(
    `Available tokens: ${state.tokensAvailable.join(', ') || 'none'}`,
  );
}

// Initialize
async function initialize() {
  console.log('Initializing activity generator...');
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`Activity interval: ${ACTIVITY_INTERVAL_MS}ms`);

  // Check connection
  try {
    const chainId = await publicClient.getChainId();
    console.log(`Connected to chain ID: ${chainId}`);
  } catch (error) {
    console.error('Failed to connect to RPC:', error.message);
    process.exit(1);
  }

  // Detect available tokens
  await detectTokens();

  // Discover active services
  await discoverServices();

  console.log('\nDiscovering seeded local operators...');
  for (const index of SEEDED_OPERATOR_ACCOUNT_INDICES) {
    await discoverSeededOperator(index);
  }

  if (state.operators.length === 0) {
    console.log(
      'No seeded operators discovered; delegation activity will stay disabled.',
    );
  }

  console.log('\nInitialization complete. Starting activity loop...\n');
}

// Main
async function main() {
  await initialize();

  // Run activity loop
  while (true) {
    try {
      await runActivityCycle();
    } catch (error) {
      console.error('Activity cycle error:', error.message);
    }

    await sleep(ACTIVITY_INTERVAL_MS);
  }
}

main().catch(console.error);
