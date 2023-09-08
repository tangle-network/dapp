import type { VAnchorActions } from '@webb-tools/abstract-api-provider/vanchor/vanchor-actions';
import { Note } from '@webb-tools/sdk-core/note';
import type { Hash } from 'viem';

const handleMutateNoteIndex = async (
  vanchorApi: VAnchorActions<any>, // TODO: remove any
  txHash: Hash,
  note: Note,
  indexBeforeInsert: number,
  anchorId: string
) => {
  const noteIndex = await vanchorApi.getLeafIndex(
    txHash,
    note,
    indexBeforeInsert,
    anchorId
  );

  const indexedNote = await Note.deserialize(note.serialize());
  indexedNote.mutateIndex(noteIndex.toString());

  return indexedNote;
};

export default handleMutateNoteIndex;
