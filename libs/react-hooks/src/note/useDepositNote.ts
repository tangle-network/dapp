import { Note } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

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
