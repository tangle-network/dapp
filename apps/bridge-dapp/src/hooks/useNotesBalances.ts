import { useWebContext } from '@webb-tools/api-provider-environment';
import values from 'lodash/values';
import { useEffect, useState } from 'react';

export type UseNotesBalancesReturnType = {
  [currencyId: number]: {
    [typedChainId: number]: bigint;
  };
};

const useNotesBalances = (): UseNotesBalancesReturnType => {
  const {
    noteManager,
    apiConfig: { currencies },
  } = useWebContext();

  const [balances, setBalances] = useState<UseNotesBalancesReturnType>({});

  useEffect(() => {
    if (!noteManager) {
      return;
    }

    const sub = noteManager.$notesUpdated.subscribe(() => {
      const nextBalancesRecord: UseNotesBalancesReturnType = {};

      // Resource id -> Note[]
      const noteRecord = noteManager.getAllNotes();

      // Iterate over all notes and sum up the balances
      Array.from(noteRecord.values()).forEach((notes) => {
        notes.forEach((note) => {
          const {
            note: { tokenSymbol, targetChainId, amount },
          } = note;

          const destChainId = Number(targetChainId);

          const currencyCfg = values(currencies).find((c) => {
            return (
              c.symbol === tokenSymbol &&
              Array.from(c.addresses.keys()).find((id) => id === destChainId)
            );
          });

          if (!currencyCfg) {
            return;
          }

          if (!nextBalancesRecord[currencyCfg.id]) {
            nextBalancesRecord[currencyCfg.id] = {};
          }

          if (!nextBalancesRecord[currencyCfg.id][destChainId]) {
            nextBalancesRecord[currencyCfg.id][destChainId] = BigInt(0);
          }

          nextBalancesRecord[currencyCfg.id][destChainId] += BigInt(amount);
        });
      });

      setBalances(nextBalancesRecord);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [currencies, noteManager]);

  return balances;
};

export default useNotesBalances;
