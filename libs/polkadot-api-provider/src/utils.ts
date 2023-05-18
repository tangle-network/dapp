import { ApiPromise } from '@polkadot/api';
import { executorWithTimeout } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import { FIELD_SIZE } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import { PolkadotProvider } from './ext-provider';
import { HexString } from '@polkadot/util/types';

const substrateProviderCache: { [typedChainId: number]: ApiPromise } = {};

export const substrateProviderFactory = async (
  typedChainId: number
): Promise<ApiPromise> => {
  const cached = substrateProviderCache[typedChainId];
  if (cached) {
    return cached;
  }

  const chain = chainsPopulated[typedChainId];
  if (!chain) {
    throw new Error(`Chain not found for ${typedChainId}`); // Development error
  }

  return executorWithTimeout(
    new Promise<ApiPromise>((res, rej) => {
      PolkadotProvider.getApiPromise('', [chain.url], (error) => {
        console.error('Error in substrateProviderFactory', error);
        error.cancel();
        rej(error);
      })
        .then((apiPromise) => {
          substrateProviderCache[typedChainId] = apiPromise;

          return res(apiPromise);
        })
        .catch(rej);
    })
  );
};

export const ensureHex = (maybeHex: string): HexString => {
  if (maybeHex.startsWith('0x')) {
    return maybeHex as `0x${string}`;
  }

  return `0x${maybeHex}`;
};

export const getVAnchorExtDataHash = (
  extData: IVariableAnchorExtData
): bigint => {
  const abi = new ethers.utils.AbiCoder();
  const encodedData = abi.encode(
    [
      'tuple(bytes recipient,bytes extAmount,bytes relayer,bytes fee,bytes refund,bytes token,bytes encryptedOutput1,bytes encryptedOutput2)',
    ],
    [extData]
  );

  const hash = ethers.utils.keccak256(encodedData);

  const hashBigInt = BigInt(ensureHex(hash));

  return hashBigInt % FIELD_SIZE.toBigInt();
};
