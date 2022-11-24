import { randRecentDate } from '@ngneat/falso';
import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { VAnchorContract } from '@webb-tools/evm-contracts';
import { useCurrencies, useNoteAccount } from '@webb-tools/react-hooks';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { ArrayElement } from '@webb-tools/webb-ui-components/types';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { SpendNoteDataType } from '../containers/SpendNotesTableContainer/types';

const assetsUrl = 'https://webb.tools';
const createdTime = randRecentDate();

export const useSpendNotes = (): SpendNoteDataType[] => {
  const { allNotes } = useNoteAccount();

  const { getWrappableCurrencies, governedCurrencies } = useCurrencies();

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

        if (!isExisted) {
          acc.push({
            address,
            typedChainId: Number(sourceChainId),
          });
        }
      });

      return acc;
    }, [] as Array<Omit<ArrayElement<typeof nextIndices>, 'nextIndex'>>);
  }, [allNotes]);

  const notes = useMemo(() => {
    return Array.from(allNotes.entries()).reduce(
      (acc, [typedChainId, notes]) => {
        notes.forEach((note) => {
          // Get the information about the chain
          const chain = chainsPopulated[Number(typedChainId)];

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
          const governedCurrency = governedCurrencies.find(
            (currency) => currency.view.symbol === note.note.tokenSymbol
          );
          if (governedCurrency) {
            const foundCurrencies = getWrappableCurrencies(governedCurrency.id);
            wrappableCurrencies = foundCurrencies;
          }

          acc.push({
            governedTokenSymbol: note.note.tokenSymbol,
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
          });
        });

        return acc;
      },
      [] as Array<SpendNoteDataType>
    );
  }, [allNotes, getWrappableCurrencies, governedCurrencies, nextIndices]);

  // Effect to get next indices asynchorously
  useEffect(() => {
    const getIndices = async () => {
      try {
        const indices = await Promise.all(
          filterChainIdsAndAddresses.map(async ({ address, typedChainId }) => {
            const provider = Web3Provider.fromUri(
              chainsPopulated[typedChainId].url
            ).intoEthersProvider();
            const contract = new VAnchorContract(provider, address, true);

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
