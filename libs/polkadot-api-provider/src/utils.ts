import { ApiPromise } from '@polkadot/api';
import { HexString } from '@polkadot/util/types';
import { executorWithTimeout } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import { FIELD_SIZE } from '@webb-tools/sdk-core';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import { ethers } from 'ethers';
import { PolkadotProvider } from './ext-provider';
import { ExtData } from '@webb-tools/wasm-utils';

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
      PolkadotProvider.getApiPromise(
        '',
        [chain.url],
        (error) => {
          error.cancel();
          rej(error);
        },
        { ignoreLog: true }
      )
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
  const extDataFromWasm = new ExtData(
    hexToU8a(extData.recipient),
    hexToU8a(extData.recipient),
    BigInt(ensureHex(extData.extAmount)).toString(),
    BigInt(ensureHex(extData.fee)).toString(),
    BigInt(ensureHex(extData.refund)).toString(),
    hexToU8a(extData.token),
    hexToU8a(extData.encryptedOutput1),
    hexToU8a(extData.encryptedOutput2)
  );

  const hash = extDataFromWasm.get_encode();

  return BigInt(u8aToHex(hash));
};
