import { NeighborEdge } from '@webb-tools/abstract-api-provider/vanchor/types';
import { ResourceId } from '@webb-tools/sdk-core/proposals';
import { Note } from '@webb-tools/sdk-core/note';
import { hexToU8a } from '@webb-tools/utils';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';

function validateNoteLeafIndex(
  note: Note,
  edges: ReadonlyArray<NeighborEdge>
): boolean {
  const { index, targetChainId } = note.note;

  // If the index is empty, we don't need to validate
  if (!index) {
    return true;
  }

  // Find the edge by target/destination typed chain id
  const edge = edges.find((e) => {
    try {
      const resour = ResourceId.fromBytes(hexToU8a(e.srcResourceID));
      const edgeTypedChainId = calculateTypedChainId(
        resour.chainType,
        resour.chainId
      );

      return edgeTypedChainId.toString() === targetChainId;
    } catch (error) {
      return false;
    }
  });

  if (!edge) {
    return false;
  }

  return BigInt(index) <= edge.latestLeafIndex;
}

export default validateNoteLeafIndex;
