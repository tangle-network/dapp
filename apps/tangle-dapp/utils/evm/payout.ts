import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import { ethers } from 'ethers';

import {
  BatchPrecompileABI,
  BatchPrecompileAddress,
  StakingInterfacePrecompileABI,
  StakingInterfacePrecompileAddress,
} from '../../constants/contract';
import { createEvmWalletClient, evmPublicClient } from './client';

export const payoutStakers = async (
  nominatorAddress: string,
  validatorAddress: string,
  era: number
): Promise<AddressType> => {
  const validator = u8aToHex(decodeAddress(validatorAddress));

  const { request } = await evmPublicClient.simulateContract({
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
    functionName: 'payoutStakers',
    args: [validator, era],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

const stakingInterface = new ethers.utils.Interface(
  StakingInterfacePrecompileABI
);

export const batchPayoutStakers = async (
  nominatorAddress: string,
  validatorEraPairs: { validatorAddress: string; era: string }[]
): Promise<AddressType> => {
  const batchCalls = validatorEraPairs.map(({ validatorAddress, era }) => {
    const validator = u8aToHex(decodeAddress(validatorAddress));
    return {
      to: StakingInterfacePrecompileAddress,
      value: 0,
      callData: stakingInterface.encodeFunctionData('payoutStakers', [
        validator,
        Number(era),
      ]),
      gasLimit: 0,
    };
  });

  const { request } = await evmPublicClient.simulateContract({
    address: BatchPrecompileAddress as AddressType,
    abi: BatchPrecompileABI,
    functionName: 'batchAll',
    args: [
      batchCalls.map((call) => call.to),
      batchCalls.map((call) => call.value),
      batchCalls.map((call) => call.callData),
      batchCalls.map((call) => call.gasLimit),
    ],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
