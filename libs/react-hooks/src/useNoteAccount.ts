import { useWebContext } from '@nepoche/api-provider-environment';
import { Note } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useNoteAccount = () => {
  const { noteManager } = useWebContext();

  const [allNotes, setAllNotes] = useState<Map<string, Note[]>>(new Map());

  useEffect(() => {
    if (!noteManager) {
      return;
    }

    // When the noteManager has its notes updated, update the react state for allNotes
    noteManager.$notesUpdated.subscribe(() => {
      setAllNotes(new Map([...noteManager.getAllNotes()]));
    });
  }, [noteManager]);

  return {
    allNotes,
  };
};
