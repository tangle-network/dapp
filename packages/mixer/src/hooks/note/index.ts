import { Note } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useDepositNotes = (values: string[]): null | Note[] => {
  const [depositNotes, setDepositNotes] = useState<Note[] | null>(null);

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
        setDepositNotes(null);
      }
    };

    handler();
  }, [values]);

  return depositNotes;
};

export const useDepositNote = (value: string): null | Note => {
  const [depositNote, setDepositNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = async () => {
      try {
        if (value === '') {
          throw new Error('empty value');
        }
        const note = await Note.deserialize(value);
        setDepositNote(note);
      } catch (e) {
        setDepositNote(null);
      }
    };

    handler();
  }, [value]);

  return depositNote;
};
