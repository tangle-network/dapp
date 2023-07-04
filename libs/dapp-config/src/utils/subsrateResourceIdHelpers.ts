import { u8aToHex, hexToU8a } from '@polkadot/util';
import { ChainType, ResourceId, toFixedHex } from '@webb-tools/sdk-core';

/**
 * A TargetSystem is 26 bytes hex encoded string of the following format
 * PalletIndex: 1 byte
 * TreeId: 4 bytes
 * we pad it with zero to make it 26 bytes
 */
export function makeSubstrateTargetSystem(
  treeId: number,
  palletIndex: string
): string {
  const rId = new Uint8Array(26);
  const index = hexToU8a(palletIndex).slice(0, 1);
  const treeBytes = hexToU8a(toFixedHex(treeId, 4));
  rId.set(index, 21); // 21-22
  rId.set(treeBytes, 22); // 22-26
  return toFixedHex(u8aToHex(rId), 26);
}

export const parseSubstrateTargetSystem = (targetSystem: string) => {
  const targetBytes = hexToU8a(targetSystem);
  const palletIndex = parseInt(u8aToHex(targetBytes.slice(21, 22)), 16);
  const treeId = parseInt(u8aToHex(targetBytes.slice(22, 26)), 16);

  return {
    palletIndex,
    treeId,
  };
};

export function createSubstrateResourceId(
  chainId: number,
  treeId: number,
  palletIndex: string
): ResourceId {
  const substrateTargetSystem = makeSubstrateTargetSystem(treeId, palletIndex);
  // set resource ID
  const resourceId = new ResourceId(
    substrateTargetSystem,
    ChainType.Substrate,
    chainId
  );
  return resourceId;
}
