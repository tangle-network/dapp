import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import { parseEther } from 'viem';

import {
  StakingInterfacePrecompileABI,
  StakingInterfacePrecompileAddress,
} from '../../constants/contract';
import { PaymentDestination } from '../../types';
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
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const { request } = await evmPublicClient.simulateContract({
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
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
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
    functionName: 'bondExtra',
    args: [value],
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
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
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
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
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
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
    functionName: 'withdrawUnbonded',
    args: [slashingSpans],
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
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
    functionName: 'setPayee',
    args: [payee],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
