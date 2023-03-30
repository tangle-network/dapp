import { useWebContext } from '@webb-tools/api-provider-environment';
import { ResourceId } from '@webb-tools/sdk-core';
import { hexToU8a } from '@webb-tools/utils';
import { ethers } from 'ethers';
import { useMemo } from 'react';

import { useNoteAccount } from '../useNoteAccount';

/**
 * Get the balances of each fungible currency
 * on the current connected chain from the notes
 * @returns {Record<number, number>} a record of currencyId to balance
 */
export const useBalancesFromNotes = (): Record<number, number> => {
  const { activeChain, apiConfig } = useWebContext();

  const { allNotes } = useNoteAccount();

  return useMemo(() => {
    if (!activeChain) {
      return {};
    }

    return Array.from(allNotes.entries()).reduce(
      (acc, [resourceIdStr, notes]) => {
        try {
          const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdStr));
          if (
            resourceId.chainType !== activeChain.chainType ||
            resourceId.chainId !== activeChain.chainId
          ) {
            return acc;
          }

          notes.forEach(({ note }) => {
            const fungibleCurrency = apiConfig.getCurrencyBySymbol(
              note.tokenSymbol
            );

            if (!fungibleCurrency) {
              return;
            }

            const existedBalance = acc[fungibleCurrency.id];
            if (!existedBalance) {
              acc[fungibleCurrency.id] = +ethers.utils.formatUnits(
                note.amount,
                note.denomination
              );
              return;
            }

            acc[fungibleCurrency.id] =
              existedBalance +
              +ethers.utils.formatUnits(note.amount, note.denomination);
          });
        } catch (error) {
          console.error('Error parsing note', error);
        }

        return acc;
      },
      {} as Record<number, number>
    );
  }, [activeChain, allNotes, apiConfig]);
};
