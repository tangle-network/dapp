import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
import { ResourceId } from '@webb-tools/sdk-core';
import { hexToU8a } from '@webb-tools/utils';
import { ethers } from 'ethers';
import { useMemo } from 'react';

import { useNoteAccount } from '../useNoteAccount';

/**
 * Get the balances of each fungible currency
 * on the current connected chain from the notes
 * @param {Chain} destChain the chain to get the balances from (default to the current chain)
 * @returns {Record<number, number>} a record of currencyId to balance
 */
export const useBalancesFromNotes = (
  destChain?: Chain
): Record<number, number> => {
  const { activeChain, apiConfig } = useWebContext();

  const { allNotes } = useNoteAccount();

  return useMemo(() => {
    return Array.from(allNotes.entries()).reduce(
      (acc, [resourceIdStr, notes]) => {
        try {
          const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdStr));
          const currentChain = destChain ?? activeChain;

          if (!currentChain) {
            console.error('No active chain found');
            return acc;
          }

          if (
            resourceId.chainType !== currentChain.chainType ||
            resourceId.chainId !== currentChain.chainId
          ) {
            return acc;
          }

          notes.forEach(({ note }) => {
            const fungibleCurrency =
              apiConfig.getCurrencyBySymbolAndTypedChainId(
                note.tokenSymbol,
                +note.targetChainId
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
  }, [activeChain, allNotes, apiConfig, destChain]);
};
