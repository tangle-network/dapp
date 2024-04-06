import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import { parseEther } from 'viem';

import {
  PrecompileAddress,
  STAKING_PRECOMPILE_ABI,
} from '../../constants/evmPrecompiles';
import { StakingPayee } from '../../types';
import { createEvmWalletClient, evmPublicClient } from './client';

const PAYEE_STAKED =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const PAYEE_STASH =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

const PAYEE_CONTROLLER =
  '0x0000000000000000000000000000000000000000000000000000000000000002';

export const bondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number,
  paymentDestination: string
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const payee =
    paymentDestination === StakingPayee.STAKED
      ? PAYEE_STAKED
      : paymentDestination === StakingPayee.STASH
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
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
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'bondExtra',
    args: [value],
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
    paymentDestination === StakingPayee.STAKED
      ? PAYEE_STAKED
      : paymentDestination === StakingPayee.STASH
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
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
    address: PrecompileAddress.STAKING,
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
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'rebond',
    args: [value],
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
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'withdrawUnbonded',
    args: [slashingSpans],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
