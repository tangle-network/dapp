import { Note } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useDepositNotes = (values: string[]): Note[] => {
  const [depositNotes, setDepositNotes] = useState<Note[]>([]);

  useEffect(() => {
    const handler = async () => {
      try {
        if (values.length === 0) {
          throw new Error('empty value');
        }
        const notes = await Promise.all(values.map((value) => Note.deserialize(value)));
        // all notes are valid
        const allNotes = notes.reduce((acc, note) => acc && note !== null, true);
        if (allNotes) {
          setDepositNotes(notes as Note[]);
        }
      } catch (e) {
        console.log('passed value was: ', values);
        console.log('Error of: ', e);
        setDepositNotes([]);
      }
    };

    handler();
  }, [values]);

  return depositNotes;
};
