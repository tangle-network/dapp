import { useWebContext } from '@webb-tools/api-provider-environment';
import { useEffect, useState } from 'react';

const useChainsFromNote = () => {
  const { noteManager } = useWebContext();

  const [typedChainIds, setTypedChainIds] = useState<Set<number>>(
    new Set<number>()
  );

  useEffect(() => {
    if (!noteManager) {
      return;
    }

    noteManager.$notesUpdated.subscribe(() => {
      const allNotes = noteManager.getAllNotes();

      const nextTypedChainIds = new Set<number>();

      Array.from(allNotes.values()).forEach((notes) => {
        notes.forEach((note) => {
          const {
            note: { targetChainId },
          } = note;
          const destChainId = Number(targetChainId);
          nextTypedChainIds.add(destChainId);
        });
      });

      setTypedChainIds(nextTypedChainIds);
    });
  }, [noteManager]);

  return typedChainIds;
};

export default useChainsFromNote;
