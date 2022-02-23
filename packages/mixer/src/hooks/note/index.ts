import { Note } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useDepositNote = (value: string): null | Note => {
  const [depositNote, setDepositNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = async () => {
      try {
        if (value === '') throw new Error('empty value');
        let d = await Note.deserialize(value);
        // const noteLeaf = d.getLeaf();
        // console.log('noteLeaf: ', noteLeaf.toString());
        console.log('Note: ', d.note);
        setDepositNote(d);
      } catch (e) {
        console.log('passed value was: ', value);
        console.log('Error of: ', e);
        setDepositNote(null);
      }
    };
    handler();
  }, [value]);

  return depositNote;
};
