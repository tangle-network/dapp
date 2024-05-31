import { Note } from '@webb-tools/sdk-core/note';
import { downloadNotes } from './downloadNotes';

async function handleStoreNote(
  note?: Note,
  addNoteToNoteManager?: (note: Note) => Promise<void>,
) {
  if (!note) {
    return;
  }

  downloadNotes([note]);

  await addNoteToNoteManager?.(note);
}

export default handleStoreNote;
