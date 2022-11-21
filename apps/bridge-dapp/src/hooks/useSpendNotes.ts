import { randRecentDate } from '@ngneat/falso';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { VAnchorContract } from '@webb-tools/evm-contracts';
import { useNoteAccount } from '@webb-tools/react-hooks';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { SpendNoteDataType } from '../containers/SpendNotesTableContainer/types';

const assetsUrl = 'https://webb.tools';
const createdTime = randRecentDate();

export const useSpendNotes = (): SpendNoteDataType[] => {
  const { noteManager } = useWebContext();
  const { allNotes } = useNoteAccount();

  const [notes, setTableNotes] = useState<SpendNoteDataType[]>([]);

  useEffect(() => {
    if (noteManager) {
      const spendNoteChainData: Promise<SpendNoteDataType>[] = [];

      Array.from(allNotes.entries()).forEach((chainGroupedNotes) => {
        chainGroupedNotes[1].forEach(async (note) => {
          // For each note, look at the sourceChain and create the contract instance
          const address = note.note.sourceIdentifyingData;
          const typedChainId = Number(note.note.sourceChainId);
          const provider = Web3Provider.fromUri(
            chainsPopulated[typedChainId].url
          ).intoEthersProvider();
          const contract = new VAnchorContract(provider, address, true);

          // Get the information about the chain
          const chain = chainsPopulated[Number(chainGroupedNotes[0])];
          spendNoteChainData.push(
            contract.getNextIndex().then((nextIndex) => {
              const subsequentDepositsNumber =
                nextIndex - Number(note.note.index);
              return {
                governedTokenSymbol: note.note.tokenSymbol,
                chain: chain.name.toLowerCase(),
                note: note.serialize(),
                assetsUrl,
                createdTime, // TODO: get the actual created time
                balance: Number(
                  ethers.utils.formatUnits(
                    note.note.amount,
                    note.note.denomination
                  )
                ),
                subsequentDeposits: note.note.index
                  ? subsequentDepositsNumber.toString()
                  : '0',
              };
            })
          );
        });
      });

      Promise.all(spendNoteChainData).then((tableData) => {
        setTableNotes(tableData);
      });
    }
  }, [allNotes, noteManager]);

  return notes;
};
