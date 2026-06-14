#!/usr/bin/env node

import fs from 'node:fs';
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
  process.env.RPC_URL ||
  'http://127.0.0.1:8545';

const EXPECTED_CHAIN_ID = 31337;

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
  delegator:
    process.env.LOCAL_STAKING_DELEGATOR_KEY ||
    '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
};

const AMOUNTS = {
  deposit: parseEther(process.env.LOCAL_STAKING_DEPOSIT || '1'),
  delegate: parseEther(process.env.LOCAL_STAKING_DELEGATE || '0.4'),
  reward: parseEther(process.env.LOCAL_STAKING_REWARD || '0.2'),
  undelegate: parseEther(process.env.LOCAL_STAKING_UNDELEGATE || '0.1'),
  withdraw: parseEther(process.env.LOCAL_STAKING_WITHDRAW || '0.05'),
};

const readTextIfExists = (path) => {
  try {
    return fs.readFileSync(path, 'utf8');
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
    name: 'depositWithLock',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'lockMultiplier', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'delegateWithOptions',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'selectionMode', type: 'uint8' },
      { name: 'blueprintIds', type: 'uint64[]' },
    ],
    outputs: [],
  },
  {
    name: 'scheduleDelegatorUnstake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'executeDelegatorUnstake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'scheduleWithdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'executeWithdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
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
  {
    name: 'claimDelegatorRewardsBatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'operators', type: 'address[]' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
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

const publicClient = createPublicClient({
  chain: anvil,
  transport: http(RPC_URL),
});

const accounts = Object.fromEntries(
  Object.entries(PRIVATE_KEYS).map(([name, privateKey]) => [
    name,
    privateKeyToAccount(privateKey),
  ]),
);

const wallets = Object.fromEntries(
  Object.entries(accounts).map(([name, account]) => [
    name,
    createWalletClient({
      account,
      chain: anvil,
      transport: http(RPC_URL),
    }),
  ]),
);

const txs = [];

const fail = (message) => {
  throw new Error(
    `${message}\n\nStart local TNT with: ./scripts/local-env/start-local-env.sh`,
  );
};

const formatError = (error) =>
  error?.shortMessage || error?.details || error?.message || String(error);

const assert = (condition, message) => {
  if (!condition) fail(message);
};

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

const write = async (wallet, label, request) => {
  let hash;

  try {
    hash = await wallet.writeContract(request);
  } catch (error) {
    fail(`${label} failed before broadcast: ${formatError(error)}`);
  }

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  assert(receipt.status === 'success', `${label} reverted: ${hash}`);

  txs.push({ label, hash, gasUsed: receipt.gasUsed.toString() });
  return receipt;
};

const depositOf = async () => {
  const deposit = await readStaking('getDeposit', [
    accounts.delegator.address,
    zeroAddress,
  ]);

  return {
    amount: deposit.amount ?? deposit[0],
    delegatedAmount: deposit.delegatedAmount ?? deposit[1],
  };
};

const pendingRewardsForOperator = async (operator) => {
  const positions = await readRewardVaults('getDelegatorPositions', [
    zeroAddress,
    accounts.delegator.address,
  ]);

  const position = positions.find(
    (entry) =>
      (entry.operator ?? entry[0]).toLowerCase() === operator.toLowerCase(),
  );

  return position ? (position.pendingRewards ?? position[5]) : 0n;
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
    await write(wallets.deployer, `advance round to ${currentRound + 1n}`, {
      address: CONTRACTS.multiAssetDelegation,
      abi: stakingAbi,
      functionName: 'advanceRound',
      args: [],
    });

    currentRound = await readStaking('currentRound');
  }
};

const verifyLocalChain = async () => {
  let chainId;

  try {
    chainId = await publicClient.getChainId();
  } catch (error) {
    fail(`local RPC is not reachable at ${RPC_URL}: ${formatError(error)}`);
  }

  assert(
    chainId === EXPECTED_CHAIN_ID,
    `expected chain ID ${EXPECTED_CHAIN_ID}, got ${chainId}`,
  );

  for (const [name, address] of Object.entries(CONTRACTS)) {
    const bytecode = await publicClient.getBytecode({ address });
    assert(bytecode, `missing code at ${name} ${address}`);
  }
};

const verifyFixture = async () => {
  const operatorMode = Number(
    await readStaking('getDelegationMode', [accounts.operator.address]),
  );
  const canDelegate = await readStaking('canDelegate', [
    accounts.operator.address,
    accounts.delegator.address,
  ]);

  assert(
    operatorMode === 2 && canDelegate,
    `operator ${accounts.operator.address} must be Open delegation mode in LocalTestnet`,
  );

  const delegatorBalance = await publicClient.getBalance({
    address: accounts.delegator.address,
  });

  assert(
    delegatorBalance > AMOUNTS.deposit,
    `delegator ${accounts.delegator.address} has insufficient native balance`,
  );
};

const run = async () => {
  await verifyLocalChain();
  await verifyFixture();

  const tntToken = await readRewardVaults('tntToken');
  const tntCode = await publicClient.getBytecode({ address: tntToken });
  assert(tntCode, `missing TNT token code at ${tntToken}`);

  const beforeDeposit = await depositOf();
  await write(wallets.delegator, 'deposit native with no lock', {
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName: 'depositWithLock',
    args: [0],
    value: AMOUNTS.deposit,
  });

  const afterDeposit = await depositOf();
  assert(
    afterDeposit.amount >= beforeDeposit.amount + AMOUNTS.deposit,
    'depositWithLock did not increase native deposited balance',
  );

  await write(wallets.delegator, 'delegate native to open operator', {
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName: 'delegateWithOptions',
    args: [accounts.operator.address, zeroAddress, AMOUNTS.delegate, 0, []],
  });

  const afterDelegate = await depositOf();
  assert(
    afterDelegate.delegatedAmount >=
      beforeDeposit.delegatedAmount + AMOUNTS.delegate,
    'delegateWithOptions did not increase delegated native balance',
  );

  const deployerTntBalance = await readErc20(tntToken, 'balanceOf', [
    accounts.deployer.address,
  ]);
  assert(
    deployerTntBalance >= AMOUNTS.reward,
    `deployer has insufficient TNT to fund reward claim: ${formatEther(deployerTntBalance)}`,
  );

  await write(wallets.deployer, 'fund RewardVaults with TNT', {
    address: tntToken,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [CONTRACTS.rewardVaults, AMOUNTS.reward],
  });

  await write(wallets.deployer, 'distribute native staking rewards', {
    address: CONTRACTS.rewardVaults,
    abi: rewardVaultsAbi,
    functionName: 'distributeRewards',
    args: [zeroAddress, accounts.operator.address, AMOUNTS.reward],
  });

  const pendingRewards = await pendingRewardsForOperator(
    accounts.operator.address,
  );
  assert(
    pendingRewards > 0n,
    'reward distribution produced no claimable rewards',
  );

  const beforeClaimTnt = await readErc20(tntToken, 'balanceOf', [
    accounts.delegator.address,
  ]);
  await write(wallets.delegator, 'claim delegator rewards batch', {
    address: CONTRACTS.rewardVaults,
    abi: rewardVaultsAbi,
    functionName: 'claimDelegatorRewardsBatch',
    args: [zeroAddress, [accounts.operator.address]],
  });

  const afterClaimTnt = await readErc20(tntToken, 'balanceOf', [
    accounts.delegator.address,
  ]);
  assert(
    afterClaimTnt > beforeClaimTnt,
    'claimDelegatorRewardsBatch did not increase delegator TNT balance',
  );

  const unstakesBefore = await readStaking('getPendingUnstakes', [
    accounts.delegator.address,
  ]);
  const unstakeRound = await readStaking('currentRound');
  await write(wallets.delegator, 'schedule native undelegation', {
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName: 'scheduleDelegatorUnstake',
    args: [accounts.operator.address, zeroAddress, AMOUNTS.undelegate],
  });

  const unstakesScheduled = await readStaking('getPendingUnstakes', [
    accounts.delegator.address,
  ]);
  assert(
    unstakesScheduled.length > unstakesBefore.length,
    'scheduleDelegatorUnstake did not create a pending unstake',
  );

  const unstakeDelay = await readStaking('delegationBondLessDelay');
  await advanceToRound(unstakeRound + unstakeDelay);
  const beforeExecuteUnstake = await depositOf();
  await write(wallets.delegator, 'execute native undelegation', {
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName: 'executeDelegatorUnstake',
    args: [],
  });

  const afterExecuteUnstake = await depositOf();
  assert(
    afterExecuteUnstake.delegatedAmount < beforeExecuteUnstake.delegatedAmount,
    'executeDelegatorUnstake did not reduce delegated native balance',
  );

  const withdrawalsBefore = await readStaking('getPendingWithdrawals', [
    accounts.delegator.address,
  ]);
  const withdrawRound = await readStaking('currentRound');
  await write(wallets.delegator, 'schedule native withdrawal', {
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName: 'scheduleWithdraw',
    args: [zeroAddress, AMOUNTS.withdraw],
  });

  const withdrawalsScheduled = await readStaking('getPendingWithdrawals', [
    accounts.delegator.address,
  ]);
  assert(
    withdrawalsScheduled.length > withdrawalsBefore.length,
    'scheduleWithdraw did not create a pending withdrawal',
  );

  const withdrawalDelay = await readStaking('leaveDelegatorsDelay');
  await advanceToRound(withdrawRound + withdrawalDelay);
  await write(wallets.delegator, 'execute native withdrawal', {
    address: CONTRACTS.multiAssetDelegation,
    abi: stakingAbi,
    functionName: 'executeWithdraw',
    args: [],
  });

  const withdrawalsAfter = await readStaking('getPendingWithdrawals', [
    accounts.delegator.address,
  ]);
  assert(
    withdrawalsAfter.length < withdrawalsScheduled.length,
    'executeWithdraw did not clear a pending withdrawal',
  );

  console.log('\nLocal staking action gate passed.');
  console.log(`RPC: ${RPC_URL}`);
  console.log(`MultiAssetDelegation: ${CONTRACTS.multiAssetDelegation}`);
  console.log(`RewardVaults: ${CONTRACTS.rewardVaults}`);
  console.log(`Delegator: ${accounts.delegator.address}`);
  console.log(`Operator: ${accounts.operator.address}`);
  console.table(txs);
};

run().catch((error) => {
  console.error(`\nLocal staking action gate failed: ${formatError(error)}`);
  process.exitCode = 1;
});
