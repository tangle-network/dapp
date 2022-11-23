import { chainsPopulated } from '@webb-tools/dapp-config';
import { useNoteAccount } from '@webb-tools/react-hooks';
import { ethers } from 'ethers';
import React from 'react';
import { ShieldedAssetDataType } from '../containers/ShieldedAssetsTableContainer/types';

const ASSETS_URL = 'https://webb.tools';

export const useShieldedAssets = (): ShieldedAssetDataType[] => {
  const { allNotes } = useNoteAccount();

  // Group notes by destination chain and symbol
  const groupedNotes = React.useMemo(() => {
    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const { targetChainId, tokenSymbol, amount, denomination } = note.note;

        const chain = chainsPopulated[Number(targetChainId)];
        const balance = ethers.utils.formatUnits(amount, denomination);

        const existedChain = acc.find(
          (item) =>
            item.chain === chain.name && item.assetSymbol === tokenSymbol
        );

        if (existedChain) {
          existedChain.availableBalance += Number(balance);
          existedChain.numberOfNotesFound += 1;
        } else {
          acc.push({
            chain: chain.name,
            assetSymbol: tokenSymbol,
            assetsUrl: ASSETS_URL, // TODO: get the actual url
            availableBalance: Number(balance),
            numberOfNotesFound: 1,
          });
        }
      });

      return acc;
    }, [] as ShieldedAssetDataType[]);
  }, [allNotes]);

  return groupedNotes;
};
