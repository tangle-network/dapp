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
  const rId = new Uint8Array(20);
  const index = hexToU8a(palletIndex).slice(0, 1);
  const treeBytes = hexToU8a(toFixedHex(treeId, 4));
  rId.set(index, 15); // 15-16
  rId.set(treeBytes, 16); // 16-20
  return u8aToHex(rId);
}

function createSubstrateResourceId(
  chainId: number,
  treeId: number,
  palletIndex: string
): ResourceId {
  const substrateTargetSystem = makeSubstrateTargetSystem(treeId, palletIndex);
  // set resource ID
  const resourceId = new ResourceId(
    toFixedHex(substrateTargetSystem, 20),
    ChainType.Substrate,
    chainId
  );
  return resourceId;
}

export default createSubstrateResourceId;
