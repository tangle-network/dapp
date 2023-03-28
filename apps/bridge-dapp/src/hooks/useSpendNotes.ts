import { randRecentDate } from '@ngneat/falso';
import { Currency } from '@webb-tools/abstract-api-provider';
import { VAnchorTree__factory } from '@webb-tools/contracts';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useCurrencies, useNoteAccount } from '@webb-tools/react-hooks';
import { ResourceId, calculateTypedChainId } from '@webb-tools/sdk-core';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { ArrayElement } from '@webb-tools/webb-ui-components/types';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { SpendNoteDataType } from '../containers/note-account-tables/SpendNotesTableContainer/types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { hexToU8a } from '@webb-tools/utils';

const createdTime = randRecentDate();

export const useSpendNotes = (): SpendNoteDataType[] => {
  const { allNotes } = useNoteAccount();

  const { getWrappableCurrencies, fungibleCurrencies } = useCurrencies();

  const { activeChain, apiConfig, chains } = useWebContext();

  const [nextIndices, setNextIndices] = useState<
    { address: string; typedChainId: number; nextIndex: number }[]
  >([]);

  // Get no overlap sourceChainId and sourceIdentifyingData from allNotes
  const filterChainIdsAndAddresses = useMemo(() => {
    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const { sourceChainId, sourceIdentifyingData: address } = note.note;

        const isExisted = acc.find(
          (val) =>
            val.address === address &&
            val.typedChainId === Number(sourceChainId)
        );

        // Check if the current chain tag is the same as the source chain tag
        const isCurrentTag =
          activeChain?.tag === apiConfig.chains[+sourceChainId]?.tag;

        if (!isExisted && isCurrentTag) {
          acc.push({
            address,
            typedChainId: Number(sourceChainId),
          });
        }
      });

      return acc;
    }, [] as Array<Omit<ArrayElement<typeof nextIndices>, 'nextIndex'>>);
  }, [allNotes, activeChain?.tag, apiConfig.chains]);

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
          const nextIndex = nextIndices.find(
            (item) =>
              item.address === note.note.sourceIdentifyingData &&
              item.typedChainId === Number(note.note.sourceChainId)
          )?.nextIndex;

          const subsequentDepositsNumber = nextIndex
            ? nextIndex - Number(note.note.index)
            : '?';

          // Calculate the wrappable currencies
          let wrappableCurrencies: Currency[] = [];
          const fungibleCurrency = fungibleCurrencies.find(
            (currency) => currency.view.symbol === note.note.tokenSymbol
          );
          if (fungibleCurrency) {
            const foundCurrencies = getWrappableCurrencies(fungibleCurrency.id);
            wrappableCurrencies = foundCurrencies;
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
            composition: wrappableCurrencies.map(
              (currency) => currency.view.symbol
            ),
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
    getWrappableCurrencies,
  ]);

  // Effect to get next indices asynchorously
  useEffect(() => {
    const getIndices = async () => {
      try {
        const indices = await Promise.all(
          filterChainIdsAndAddresses.map(async ({ address, typedChainId }) => {
            const provider = Web3Provider.fromUri(
              chainsPopulated[typedChainId].url
            ).intoEthersProvider();
            const contract = VAnchorTree__factory.connect(address, provider);
            const nextIndex = await contract.getNextIndex();
            return {
              address,
              typedChainId,
              nextIndex,
            };
          })
        );

        setNextIndices(indices);
      } catch (error) {
        console.log('Error while getting next indices', error);
      }
    };

    getIndices();
  }, [filterChainIdsAndAddresses]);

  return notes;
};
