import downloadString from '@webb-tools/browser-utils/download/downloadString';
import { Note } from '@webb-tools/sdk-core/note';

async function handleStoreNote(
  note?: Note,
  addNoteToNoteManager?: (note: Note) => Promise<void>
) {
  if (!note) {
    return;
  }

  const changeNoteStr = note.serialize();
  downloadString(
    JSON.stringify(changeNoteStr),
    changeNoteStr.slice(0, changeNoteStr.length - 10) + '.json'
  );

  await addNoteToNoteManager?.(note);
}

export default handleStoreNote;
