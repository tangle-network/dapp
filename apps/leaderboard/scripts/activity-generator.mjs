#!/usr/bin/env node
/**
 * Continuous Activity Generator for Leaderboard Testing
 *
 * This script generates random blockchain activity at regular intervals
 * to simulate real-world usage patterns for the leaderboard.
 *
 * Activities generated:
 * - Deposits (native ETH and ERC20 tokens)
 * - Delegations to operators
 * - Operator registrations
 * - Blueprint creations
 * - Service requests and activations
 * - Job submissions
 */

import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const ACTIVITY_INTERVAL_MS = parseInt(process.env.ACTIVITY_INTERVAL_MS || '10000'); // 10 seconds default

// Contract addresses (deterministic from Anvil)
const CONTRACTS = {
  tangle: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  multiAssetDelegation: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  statusRegistry: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
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

// ABI fragments for contract interactions
const MULTI_ASSET_DELEGATION_ABI = [
  {
    name: 'deposit',
    type: 'function',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'lock', type: 'uint8' },
    ],
    outputs: [],
  },
  {
    name: 'delegate',
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'blueprintSelection', type: 'tuple',
        components: [
          { name: 'mode', type: 'uint8' },
          { name: 'blueprintIds', type: 'uint64[]' },
        ]
      },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'registerAsOperator',
    type: 'function',
    inputs: [{ name: 'stake', type: 'uint256' }],
    outputs: [],
  },
];

// State tracking
const state = {
  operators: [],
  delegators: [],
  blueprintIds: [1n], // Default blueprint from LocalTestnet setup
  serviceIds: [],
  activityCount: 0,
};

// Clients
const publicClient = createPublicClient({
  chain: { ...anvil, id: 84532 },
  transport: http(RPC_URL),
});

const getWalletClient = (privateKey) => {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: { ...anvil, id: 84532 },
    transport: http(RPC_URL),
  });
};

// Utility functions
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max) => parseEther(String(min + Math.random() * (max - min)));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Activity generators
async function depositNativeToken(accountIndex) {
  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const amount = randomAmount(0.1, 2);

  console.log(`[DEPOSIT] Account ${accountIndex} depositing ${amount / BigInt(1e18)} ETH`);

  try {
    const hash = await walletClient.sendTransaction({
      to: CONTRACTS.multiAssetDelegation,
      value: amount,
      data: encodeFunctionData({
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'deposit',
        args: [
          '0x0000000000000000000000000000000000000000', // Native token
          amount,
          0, // No lock
        ],
      }),
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[DEPOSIT] Success: ${hash}`);

    if (!state.delegators.includes(accountIndex)) {
      state.delegators.push(accountIndex);
    }

    return true;
  } catch (error) {
    console.error(`[DEPOSIT] Failed:`, error.message);
    return false;
  }
}

async function delegateToOperator(accountIndex, operatorIndex) {
  if (state.operators.length === 0) {
    console.log('[DELEGATE] No operators available');
    return false;
  }

  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const operatorAccount = privateKeyToAccount(ANVIL_ACCOUNTS[operatorIndex || randomChoice(state.operators)]);
  const amount = randomAmount(0.05, 0.5);

  console.log(`[DELEGATE] Account ${accountIndex} delegating ${amount / BigInt(1e18)} ETH to operator ${operatorAccount.address.slice(0, 10)}...`);

  try {
    const hash = await walletClient.sendTransaction({
      to: CONTRACTS.multiAssetDelegation,
      data: encodeFunctionData({
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'delegate',
        args: [
          operatorAccount.address,
          '0x0000000000000000000000000000000000000000', // Native token
          amount,
          { mode: 0, blueprintIds: [] }, // All blueprints
        ],
      }),
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[DELEGATE] Success: ${hash}`);
    return true;
  } catch (error) {
    console.error(`[DELEGATE] Failed:`, error.message);
    return false;
  }
}

async function registerOperator(accountIndex) {
  const privateKey = ANVIL_ACCOUNTS[accountIndex];
  const walletClient = getWalletClient(privateKey);
  const stake = randomAmount(5, 20);

  console.log(`[REGISTER_OPERATOR] Account ${accountIndex} registering with ${stake / BigInt(1e18)} ETH stake`);

  try {
    const hash = await walletClient.sendTransaction({
      to: CONTRACTS.multiAssetDelegation,
      value: stake,
      data: encodeFunctionData({
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'registerAsOperator',
        args: [stake],
      }),
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[REGISTER_OPERATOR] Success: ${hash}`);

    if (!state.operators.includes(accountIndex)) {
      state.operators.push(accountIndex);
    }

    return true;
  } catch (error) {
    console.error(`[REGISTER_OPERATOR] Failed:`, error.message);
    return false;
  }
}

// Main activity loop
async function runActivityCycle() {
  state.activityCount++;
  console.log(`\n=== Activity Cycle ${state.activityCount} ===`);

  // Pick a random activity type
  const activityTypes = [
    { name: 'deposit', weight: 40 },
    { name: 'delegate', weight: 30 },
    { name: 'registerOperator', weight: 10 },
    { name: 'multiDeposit', weight: 20 },
  ];

  const totalWeight = activityTypes.reduce((sum, a) => sum + a.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedActivity = activityTypes[0].name;

  for (const activity of activityTypes) {
    random -= activity.weight;
    if (random <= 0) {
      selectedActivity = activity.name;
      break;
    }
  }

  // Pick random accounts (skip account 0 which is the deployer)
  const accountIndex = 1 + Math.floor(Math.random() * (ANVIL_ACCOUNTS.length - 1));

  switch (selectedActivity) {
    case 'deposit':
      await depositNativeToken(accountIndex);
      break;

    case 'delegate':
      // Need to deposit first if not already a delegator
      if (!state.delegators.includes(accountIndex)) {
        await depositNativeToken(accountIndex);
        await sleep(2000); // Wait for deposit to be processed
      }
      await delegateToOperator(accountIndex);
      break;

    case 'registerOperator':
      if (!state.operators.includes(accountIndex)) {
        await registerOperator(accountIndex);
      }
      break;

    case 'multiDeposit':
      // Multiple accounts deposit at once
      const accounts = [1, 2, 3].map(() =>
        1 + Math.floor(Math.random() * (ANVIL_ACCOUNTS.length - 1))
      );
      await Promise.all(accounts.map(idx => depositNativeToken(idx)));
      break;
  }

  console.log(`\nState: ${state.operators.length} operators, ${state.delegators.length} delegators`);
}

// Initialize with some operators
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

  // Register a few initial operators
  console.log('\nRegistering initial operators...');
  for (let i = 1; i <= 3; i++) {
    await registerOperator(i);
    await sleep(2000);
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
