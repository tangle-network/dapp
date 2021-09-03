import { Note } from '@webb-tools/sdk-mixer';
import { useEffect, useState } from 'react';

export const useDepositNote = (value: string): null | Note => {
  const [depositNote, setDepositNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = async () => {
      try {
        let d = await Note.deserialize(value);
        setDepositNote(d);
      } catch (_) {
        setDepositNote(null);
      }
    };
    handler();
  }, [value]);

  return depositNote;
};
