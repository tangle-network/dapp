import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  parseEther,
} from 'viem';

import { PaymentDestination } from '../types';
import { PrecompileAddress, STAKING_PRECOMPILE_ABI } from './evmPrecompiles';

const PAYEE_STAKED =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const PAYEE_STASH =
  '0x0000000000000000000000000000000000000000000000000000000000000001';
const PAYEE_CONTROLLER =
  '0x0000000000000000000000000000000000000000000000000000000000000002';

export const PAYMENT_DESTINATION_OPTIONS = [
  'Staked (increase the amount at stake)',
  'Stash (do not increase the amount at stake)',
];

const tangleTestnetConfig = chainsConfig[PresetTypedChainId.TangleTestnet];
delete tangleTestnetConfig.contracts;

const tangleTestnet = defineChain(tangleTestnetConfig);

export const evmPublicClient = createPublicClient({
  chain: tangleTestnet,
  transport: http(),
});

export const createEvmWalletClient = (nominatorAddress: string) =>
  createWalletClient({
    chain: tangleTestnet,
    account: ensureHex(nominatorAddress),
    transport: custom(window.ethereum),
  });

export const bondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number,
  paymentDestination: string
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());
  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'bond',
    args: [value, payee],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const bondExtraTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'bondExtra',
    args: [value],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const nominateValidators = async (
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<AddressType> => {
  const targets = validatorAddresses.map((address) => {
    return u8aToHex(decodeAddress(address));
  });

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'nominate',
    args: [targets],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const updatePaymentDestination = async (
  nominatorAddress: string,
  paymentDestination: string
): Promise<AddressType> => {
  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'setPayee',
    args: [payee],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const unBondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'unbond',
    args: [value],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const rebondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'rebond',
    args: [value],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const stopNomination = async (
  nominatorAddress: string
): Promise<AddressType> => {
  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'chill',
    args: [],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const withdrawUnbondedTokens = async (
  nominatorAddress: string,
  slashingSpans: number
): Promise<AddressType> => {
  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'withdrawUnbonded',
    args: [slashingSpans],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
