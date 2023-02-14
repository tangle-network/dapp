import { Currency } from '@webb-tools/abstract-api-provider';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useCurrencies, useNoteAccount } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React from 'react';

import { ShieldedAssetDataType } from '../containers/note-account-tables/ShieldedAssetsTableContainer/types';
import { useWebContext } from '@webb-tools/api-provider-environment';

export const useShieldedAssets = (): ShieldedAssetDataType[] => {
  const { allNotes } = useNoteAccount();

  const { activeChain } = useWebContext();

  const { getWrappableCurrencies, fungibleCurrencies } = useCurrencies();

  // Group notes by destination chain and symbol
  const groupedNotes = React.useMemo(() => {
    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const { targetChainId, tokenSymbol, amount, denomination } = note.note;

        const chain = chainsPopulated[Number(targetChainId)];
        const balance = ethers.utils.formatUnits(amount, denomination);

        if (chain.tag !== activeChain?.tag) {
          return;
        }

        const existedChain = acc.find(
          (item) =>
            item.chain === chain.name &&
            item.fungibleTokenSymbol === tokenSymbol
        );

        if (existedChain) {
          existedChain.availableBalance = Number(
            Number(balance) + existedChain.availableBalance
          );
          existedChain.numberOfNotesFound += 1;
          existedChain.rawNotes.push(note);
          return;
        }

        let wrappableCurrencies: Currency[] = [];

        const fungibleCurrency = fungibleCurrencies.find(
          (currency) => currency.view.symbol === tokenSymbol
        );

        if (fungibleCurrency) {
          const foundCurrencies = getWrappableCurrencies(fungibleCurrency.id);

          wrappableCurrencies = foundCurrencies;
        }

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
          chain: chain.name,
          fungibleTokenSymbol: tokenSymbol,
          assetsUrl,
          composition: wrappableCurrencies.map(
            (currency) => currency.view.symbol
          ),
          availableBalance: Number(Number(balance).toFixed(8)),
          numberOfNotesFound: 1,
          rawChain: chain,
          rawFungibleCurrency: fungibleCurrency,
          rawNotes: [note],
        });
      });

      return acc;
    }, [] as ShieldedAssetDataType[]);
  }, [activeChain?.tag, allNotes, fungibleCurrencies, getWrappableCurrencies]);

  return groupedNotes;
};
