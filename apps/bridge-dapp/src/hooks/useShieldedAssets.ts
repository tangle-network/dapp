import { chainsPopulated } from '@webb-tools/dapp-config';
import { useCurrencies, useNoteAccount } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import React from 'react';
import { formatUnits, parseUnits } from 'viem';
import { ShieldedAssetDataType } from '../containers/note-account-tables/ShieldedAssetsTableContainer/types';

export const useShieldedAssets = (): ShieldedAssetDataType[] => {
  const { allNotes } = useNoteAccount();

  const { allFungibleCurrencies: fungibleCurrencies, getWrappableCurrencies } =
    useCurrencies();

  // Group notes by destination chain and symbol
  const groupedNotes = React.useMemo(() => {
    return Array.from(allNotes.values()).reduce((acc, notes) => {
      notes.forEach((note) => {
        const {
          targetChainId,
          tokenSymbol,
          amount: amountStr,
          denomination: denominationStr,
        } = note.note;

        const amount = BigInt(amountStr);
        const denomination = Number(denominationStr);

        const chain = chainsPopulated[Number(targetChainId)];
        // This could happen in the case of a chain being removed from the
        // config, but the user still has notes from that chain.
        if (!chain) {
          console.warn(`Typed Chain (${targetChainId}) not supported anymore!`);
          return;
        }

        const existedChain = acc.find(
          (item) =>
            item.chain === chain.name &&
            item.fungibleTokenSymbol === tokenSymbol
        );

        if (existedChain) {
          const parsedAvailableBalance = parseUnits(
            numberToString(existedChain.availableBalance),
            denomination
          );

          const summedBalance = amount + parsedAvailableBalance;

          existedChain.availableBalance = Number(
            formatUnits(summedBalance, denomination)
          );

          existedChain.numberOfNotesFound += 1;
          existedChain.rawNotes.push(note);
          return;
        }

        const compositionSet = new Set<string>();
        const fungibleCurrency = fungibleCurrencies.find(
          (currency) => currency.view.symbol === tokenSymbol
        );

        if (fungibleCurrency) {
          const foundCurrencies = getWrappableCurrencies(
            fungibleCurrency.id,
            false
          );

          foundCurrencies.forEach((c) =>
            compositionSet.add(c.view.symbol.toUpperCase())
          );
        }

        let assetsUrl = '#';
        const explorerUrl = chain.blockExplorers?.default.url;
        const address = fungibleCurrency?.getAddressOfChain(
          calculateTypedChainId(chain.chainType, chain.id)
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
          composition: Array.from(compositionSet),
          availableBalance: Number(formatUnits(amount, denomination)),
          numberOfNotesFound: 1,
          rawChain: chain,
          rawFungibleCurrency: fungibleCurrency,
          rawNotes: [note],
        });
      });

      return acc;
    }, [] as ShieldedAssetDataType[]);
  }, [allNotes, fungibleCurrencies, getWrappableCurrencies]);

  return groupedNotes;
};
