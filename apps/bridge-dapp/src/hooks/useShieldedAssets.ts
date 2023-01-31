import { Currency } from '@webb-tools/abstract-api-provider';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useCurrencies, useNoteAccount } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React from 'react';
import { ShieldedAssetDataType } from '../containers/ShieldedAssetsTableContainer/types';

export const useShieldedAssets = (): ShieldedAssetDataType[] => {
  const { allNotes } = useNoteAccount();

  const { getWrappableCurrencies, fungibleCurrencies } = useCurrencies();

  // Group notes by destination chain and symbol
  const groupedNotes = React.useMemo(() => {
    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const { targetChainId, tokenSymbol, amount, denomination } = note.note;

        const chain = chainsPopulated[Number(targetChainId)];
        const balance = ethers.utils.formatUnits(amount, denomination);

        const existedChain = acc.find(
          (item) =>
            item.chain === chain.name &&
            item.fungibleTokenSymbol === tokenSymbol
        );

        if (existedChain) {
          existedChain.availableBalance = Number(
            Number(Number(balance) + existedChain.availableBalance).toFixed(6)
          );
          existedChain.numberOfNotesFound += 1;
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
          rawChain: chain,
          fungibleTokenSymbol: tokenSymbol,
          rawFungibleCurrency: fungibleCurrency,
          assetsUrl,
          composition: wrappableCurrencies.map(
            (currency) => currency.view.symbol
          ),
          availableBalance: Number(Number(balance).toFixed(6)),
          numberOfNotesFound: 1,
        });
      });

      return acc;
    }, [] as ShieldedAssetDataType[]);
  }, [allNotes, fungibleCurrencies, getWrappableCurrencies]);

  return groupedNotes;
};
