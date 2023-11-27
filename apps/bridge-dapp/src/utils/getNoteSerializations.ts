import type { Note } from '@webb-tools/sdk-core';

const getNoteSerializations = (notes: Note[]) => {
  return notes.map((note) => note.serialize());
};

export default getNoteSerializations;
