import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
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
import {
  StakingInterfacePrecompileABI,
  StakingInterfacePrecompileAddress,
} from './contract';

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

const createEvmWalletClient = (nominatorAddress: string) =>
  createWalletClient({
    chain: tangleTestnet,
    account: ensureHex(nominatorAddress),
    transport: custom(window.ethereum),
  });

export const bondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number,
  paymentDestination: string
): Promise<`0x${string}`> => {
  const value = parseEther(numberOfTokens.toString());
  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  try {
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
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const bondExtraTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<`0x${string}`> => {
  const value = parseEther(numberOfTokens.toString());

  try {
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
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const nominateValidators = async (
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<`0x${string}`> => {
  const targets = validatorAddresses.map((address) => {
    return u8aToHex(decodeAddress(address));
  });

  try {
    const { request } = await evmPublicClient.simulateContract({
      address: StakingInterfacePrecompileAddress,
      abi: StakingInterfacePrecompileABI,
      functionName: 'nominate',
      args: [targets],
      account: ensureHex(nominatorAddress),
    });

    const evmWalletClient = createEvmWalletClient(nominatorAddress);

    const txHash = await evmWalletClient.writeContract(request);

    return txHash;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const updatePaymentDestination = async (
  nominatorAddress: string,
  paymentDestination: string
): Promise<`0x${string}`> => {
  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  try {
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
  } catch (e: any) {
    throw new Error(e);
  }
};
