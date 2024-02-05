import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';

import {
  StakingInterfacePrecompileABI,
  StakingInterfacePrecompileAddress,
} from '../../constants/contract';
import { createEvmWalletClient, evmPublicClient } from './client';

export const nominateValidators = async (
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<AddressType> => {
  const targets = validatorAddresses.map((address) => {
    return u8aToHex(decodeAddress(address));
  });

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
};

export const stopNomination = async (
  nominatorAddress: string
): Promise<AddressType> => {
  const { request } = await evmPublicClient.simulateContract({
    address: StakingInterfacePrecompileAddress,
    abi: StakingInterfacePrecompileABI,
    functionName: 'chill',
    args: [],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
