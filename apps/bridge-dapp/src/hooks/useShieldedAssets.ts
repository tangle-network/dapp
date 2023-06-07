import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { CurrencyRole } from '@webb-tools/dapp-types';
import { useCurrencies, useNoteAccount } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { BigNumber, ethers } from 'ethers';
import React, { useMemo } from 'react';

import { ShieldedAssetDataType } from '../containers/note-account-tables/ShieldedAssetsTableContainer/types';

export const useShieldedAssets = (): ShieldedAssetDataType[] => {
  const { allNotes } = useNoteAccount();

  const { activeChain } = useWebContext();

  const { allFungibleCurrencies: fungibleCurrencies, getWrappableCurrencies } =
    useCurrencies();

  // Group notes by destination chain and symbol
  const groupedNotes = React.useMemo(() => {
    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const { targetChainId, tokenSymbol, amount, denomination } = note.note;

        const chain = chainsPopulated[Number(targetChainId)];
        // This could happen in the case of a chain being removed from the
        // config, but the user still has notes from that chain.
        if (!chain) {
          console.warn(`Typed Chain (${targetChainId}) not supported anymore!`);
          return;
        }
        if (chain.tag !== activeChain?.tag) {
          return;
        }

        const existedChain = acc.find(
          (item) =>
            item.chain === chain.name &&
            item.fungibleTokenSymbol === tokenSymbol
        );

        if (existedChain) {
          const parsedAvailableBalance = ethers.utils.parseUnits(
            existedChain.availableBalance.toString(),
            denomination
          );

          const summedBalance = BigNumber.from(amount).add(
            parsedAvailableBalance
          );

          existedChain.availableBalance = Number(
            ethers.utils.formatUnits(summedBalance, denomination)
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
          const foundCurrencies = getWrappableCurrencies(
            fungibleCurrency.id,
            false
          );

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
          availableBalance: Number(
            ethers.utils.formatUnits(amount, denomination)
          ),
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
