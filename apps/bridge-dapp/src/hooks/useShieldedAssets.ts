import { Currency } from '@webb-tools/abstract-api-provider';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useNoteAccount, useCurrencies } from '@webb-tools/react-hooks';
import { ethers } from 'ethers';
import React from 'react';
import { ShieldedAssetDataType } from '../containers/ShieldedAssetsTableContainer/types';

const ASSETS_URL = 'https://webb.tools';

export const useShieldedAssets = (): ShieldedAssetDataType[] => {
  const { allNotes } = useNoteAccount();

  const { getWrappableCurrencies, governedCurrencies } = useCurrencies();

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
            item.governedTokenSymbol === tokenSymbol
        );

        if (existedChain) {
          existedChain.availableBalance += Number(balance);
          existedChain.numberOfNotesFound += 1;
          return;
        }

        let wrappableCurrencies: Currency[] = [];

        const governedCurrency = governedCurrencies.find(
          (currency) => currency.view.symbol === tokenSymbol
        );

        if (governedCurrency) {
          const foundCurrencies = getWrappableCurrencies(governedCurrency.id);

          wrappableCurrencies = foundCurrencies;
        }

        acc.push({
          chain: chain.name,
          governedTokenSymbol: tokenSymbol,
          assetsUrl: ASSETS_URL, // TODO: get the actual url
          composition: wrappableCurrencies.map(
            (currency) => currency.view.symbol
          ),
          availableBalance: Number(balance),
          numberOfNotesFound: 1,
        });
      });

      return acc;
    }, [] as ShieldedAssetDataType[]);
  }, [allNotes, governedCurrencies, getWrappableCurrencies]);

  return groupedNotes;
};
