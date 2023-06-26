import { randRecentDate } from '@ngneat/falso';
import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { CurrencyRole } from '@webb-tools/dapp-types';
import {
  useCurrencies,
  useNoteAccount,
  useVAnchor,
} from '@webb-tools/react-hooks';
import {
  ResourceId,
  calculateTypedChainId,
  parseTypedChainId,
} from '@webb-tools/sdk-core';
import { hexToU8a } from '@webb-tools/utils';
import { ArrayElement } from '@webb-tools/webb-ui-components/types';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { SpendNoteDataType } from '../containers/note-account-tables/SpendNotesTableContainer/types';
import { getVAnchorActionClass } from '../utils';

const createdTime = randRecentDate();

export const useSpendNotes = (): SpendNoteDataType[] => {
  const { allNotes } = useNoteAccount();

  const { allFungibleCurrencies: fungibleCurrencies, getWrappableCurrencies } =
    useCurrencies();

  const { activeChain, apiConfig, chains } = useWebContext();

  const { api: vAnchorApi } = useVAnchor();

  const [nextIndices, setNextIndices] = useState<
    { fungibleCurrencyId: number; typedChainId: number; nextIndex: number }[]
  >([]);

  // Get no overlap sourceChainId and sourceIdentifyingData from allNotes
  const filterChainIdsAndAddresses = useMemo(() => {
    if (!apiConfig) {
      return [];
    }

    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const { sourceChainId, tokenSymbol } = note.note;

        const fungible = Object.values(apiConfig.currencies)
          .filter((c) => c.role === CurrencyRole.Governable)
          .find(
            (c) => c.symbol === tokenSymbol && c.addresses.has(+sourceChainId)
          );
        if (!fungible) {
          return acc;
        }

        const isExisted = acc.find(
          (val) =>
            val.fungibleCurrencyId === fungible.id &&
            val.typedChainId === Number(sourceChainId)
        );

        // Check if the current chain tag is the same as the source chain tag
        const isCurrentTag =
          activeChain?.tag === apiConfig.chains[+sourceChainId]?.tag;

        if (!isExisted && isCurrentTag) {
          acc.push({
            fungibleCurrencyId: fungible.id,
            typedChainId: Number(sourceChainId),
          });
        }
      });

      return acc;
    }, [] as Array<Omit<ArrayElement<typeof nextIndices>, 'nextIndex'>>);
  }, [apiConfig, allNotes, activeChain?.tag]);

  const notes = useMemo(() => {
    return Array.from(allNotes.entries()).reduce(
      (acc, [resourceIdStr, notes]) => {
        const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdStr));
        const typedChainId = calculateTypedChainId(
          resourceId.chainType,
          resourceId.chainId
        );

        const chain = chains[typedChainId];
        if (!chain) {
          console.trace('Chain not found with typedChainId: ', typedChainId);
          return acc;
        }

        if (chain.tag !== activeChain?.tag) {
          return acc;
        }

        notes.forEach((note) => {
          const nextIndex = nextIndices.find((item) => {
            const fungible = apiConfig.currencies[item.fungibleCurrencyId];
            if (!fungible) {
              console.error(
                'Fungible currency not found with id: ',
                item.fungibleCurrencyId
              );
              return false;
            }

            return (
              item.fungibleCurrencyId === fungible.id &&
              item.typedChainId === Number(note.note.sourceChainId)
            );
          })?.nextIndex;

          const subsequentDepositsNumber = nextIndex
            ? nextIndex - Number(note.note.index)
            : '?';

          // Calculate the wrappable currencies
          const compositionSet = new Set<string>();
          const fungibleCurrency = fungibleCurrencies.find((currency) => {
            return (
              currency.view.symbol === note.note.tokenSymbol &&
              currency.hasChain(+note.note.targetChainId)
            );
          });
          if (fungibleCurrency) {
            const foundCurrencies = getWrappableCurrencies(
              fungibleCurrency.id,
              false
            );
            foundCurrencies.forEach((c) =>
              compositionSet.add(c.view.symbol.toUpperCase())
            );
          }

          // Calculate the assets url
          let assetsUrl = '#';
          const explorerUrl = chain.blockExplorerStub;
          const address = fungibleCurrency?.getAddressOfChain(
            calculateTypedChainId(chain.chainType, chain.chainId)
          );

          if (explorerUrl && address) {
            assetsUrl = explorerUrl.endsWith('/')
              ? `${explorerUrl}address/${address}`
              : `${explorerUrl}/address/${address}`;
          }

          acc.push({
            fungibleTokenSymbol: note.note.tokenSymbol,
            chain: chain.name.toLowerCase(),
            note: note.serialize(),
            assetsUrl,
            composition: Array.from(compositionSet),
            createdTime, // TODO: get the actual created time
            balance: Number(
              ethers.utils.formatUnits(note.note.amount, note.note.denomination)
            ),
            subsequentDeposits: note.note.index
              ? subsequentDepositsNumber.toString()
              : '0',
            rawFungibleCurrency: fungibleCurrency,
            rawChain: chain,
            rawNote: note,
          });
        });

        return acc;
      },
      [] as Array<SpendNoteDataType>
    );
  }, [
    allNotes,
    chains,
    activeChain?.tag,
    nextIndices,
    fungibleCurrencies,
    apiConfig.currencies,
    getWrappableCurrencies,
  ]);

  // Effect to get next indices asynchorously
  useEffect(() => {
    const getIndices = async () => {
      if (!vAnchorApi) {
        return;
      }

      try {
        const indices = await Promise.all(
          filterChainIdsAndAddresses.map(
            async ({ fungibleCurrencyId, typedChainId }) => {
              const { chainType } = parseTypedChainId(typedChainId);
              const VAnchorAction = getVAnchorActionClass(chainType);

              const idx = await VAnchorAction.getNextIndex(
                apiConfig,
                typedChainId,
                fungibleCurrencyId
              );

              return {
                fungibleCurrencyId,
                typedChainId,
                nextIndex: Number(idx),
              };
            }
          )
        );

        setNextIndices(indices);
      } catch (error) {
        console.log('Error while getting next indices', error);
      }
    };

    getIndices();
  }, [apiConfig, filterChainIdsAndAddresses, vAnchorApi]);

  return notes;
};
