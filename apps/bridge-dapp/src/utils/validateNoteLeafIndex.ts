import { NeighborEdge } from '@webb-tools/abstract-api-provider/vanchor/types';
import { Note } from '@webb-tools/sdk-core/note';

function validateNoteLeafIndex(
  note: Note,
  edges: ReadonlyArray<NeighborEdge>
): boolean {
  const { index, sourceChainId } = note.note;
  // If the index is empty, we don't need to validate
  if (!index) {
    return true;
  }

  // Find the edge by target/destination typed chain id
  const edge = edges.find((e) => e.chainID === BigInt(sourceChainId));

  if (!edge) {
    return false;
  }

  return BigInt(index) <= edge.latestLeafIndex;
}

export default validateNoteLeafIndex;
