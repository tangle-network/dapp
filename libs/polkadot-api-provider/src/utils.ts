import { HexString } from '@polkadot/util/types';
import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import { ExtData } from '@webb-tools/wasm-utils';

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
