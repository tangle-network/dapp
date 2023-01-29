import { downloadString } from '@webb-tools/browser-utils';
import { Note } from '@webb-tools/sdk-core';
import React from 'react';

/**
 * Convert notes to strings and download them as json file
 * @param notes the notes to download
 * @returns boolean - true if the download was successful
 */
export const downloadNotes = (notes: Note[]) => {
  const serializedNotes = notes.map((note) => note.serialize());

  try {
    downloadString(JSON.stringify(serializedNotes), 'notes.json', '.json');
    return true;
  } catch (error) {
    console.log('Error while downloading notes', error);
    return false;
  }
};
