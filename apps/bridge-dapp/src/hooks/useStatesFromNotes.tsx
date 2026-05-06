import { Bridge, Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { CurrencyRole } from '@webb-tools/dapp-types';
import {
  useCurrentResourceId,
  useCurrentTypedChainId,
  useNoteAccount,
} from '@webb-tools/react-hooks';
import { Note, ResourceId, calculateTypedChainId } from '@webb-tools/sdk-core';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import { BigNumber, ethers } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useShieldedAssets } from './useShieldedAssets';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { ChainListCardWrapper } from '../components';

/**
 * Hook to share the states which are calculated from notes
 * of the currenct resource id and filter by the fungible currency
 * between the withdraw and tranfer components
 */
const useStatesFromNotes = () => {
  const { apiConfig, activeChain, activeWallet, switchChain } = useWebContext();

  const { setMainComponent } = useWebbUI();

  const { allNotes } = useNoteAccount();

  const currentResourceId = useCurrentResourceId();

  const currentTypedChainId = useCurrentTypedChainId();

  const shieldedAssets = useShieldedAssets();

  const [fungibleCurrency, setFungibleCurrency] = useState<
    Currency | undefined
  >();

  const availableNotes = useMemo<Note[]>(() => {
    if (!currentResourceId) {
      return [];
    }

    // Get the notes of the currently selected chain.
    const notes = allNotes
      .get(currentResourceId.toString())
      ?.filter(
        (note) => note.note.tokenSymbol === fungibleCurrency?.view?.symbol
      );

    return notes ?? [];
  }, [allNotes, currentResourceId, fungibleCurrency?.view?.symbol]);

  const availableAmountFromNotes: number = useMemo(() => {
    if (!availableNotes.length) {
      return 0;
    }

    let tokenDecimals: number | undefined;
    const amountBN = availableNotes.reduce<BigNumber>(
      (accumulatedBalance, newNote) => {
        if (!tokenDecimals) {
          tokenDecimals = Number(newNote.note.denomination);
        }

        return accumulatedBalance.add(newNote.note.amount);
      },
      BigNumber.from(0)
    );

    return Number(ethers.utils.formatUnits(amountBN, tokenDecimals));
  }, [availableNotes]);

  const chainsFromNotes = useMemo(() => {
    // If current chain has balance, then no need to show other chains
    if (availableAmountFromNotes > 0) {
      return [];
    }

    // If current chain has no balance, then show other chains
    // which has balance
    return shieldedAssets
      .filter((asset) =>
        fungibleCurrency
          ? asset.fungibleTokenSymbol === fungibleCurrency.view.symbol
          : true
      )
      .map((asset) => asset.rawChain);
  }, [availableAmountFromNotes, fungibleCurrency, shieldedAssets]);

  const needSwitchChain = useMemo(() => {
    return fungibleCurrency && chainsFromNotes.length > 0;
  }, [fungibleCurrency, chainsFromNotes]);

  const fungiblesFromNotes = useMemo<Currency[]>(() => {
    const avaiFungibleIdSet = Array.from(allNotes.keys()).reduce(
      (acc, resourceIdHex) => {
        const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdHex));
        const typedChainId = calculateTypedChainId(
          resourceId.chainType,
          resourceId.chainId
        );

        const fungibleCurrencies = apiConfig.getCurrenciesBy({
          role: CurrencyRole.Governable,
        });

        const fungible = fungibleCurrencies.find((c) => {
          const anchorAddress = apiConfig.getAnchorAddress(c.id, typedChainId);

          if (!anchorAddress) {
            return false;
          }

          return (
            BigInt(anchorAddress) === BigInt(u8aToHex(resourceId.targetSystem))
          );
        });

        if (fungible) {
          acc.add(fungible.id);
        }

        return acc;
      },
      new Set<number>()
    );

    const res = Currency.fromArray(
      Array.from(avaiFungibleIdSet).map((id) => apiConfig.currencies[id])
    );

    const defaultFungible =
      currentTypedChainId && res.find((c) => c.hasChain(currentTypedChainId));

    if (defaultFungible) {
      setFungibleCurrency?.(defaultFungible);
    }

    return res;
  }, [allNotes, currentTypedChainId, apiConfig, setFungibleCurrency]);

  const handleSwitchToOtherChains = useCallback(async () => {
    if (chainsFromNotes.length === 0 || !activeWallet) {
      return;
    }

    if (chainsFromNotes.length === 1) {
      const chain = chainsFromNotes[0];

      let bridge: Bridge | undefined;
      const bridgeConfig =
        fungibleCurrency && apiConfig.bridgeByAsset[fungibleCurrency.id];
      if (bridgeConfig) {
        bridge = new Bridge(fungibleCurrency, bridgeConfig.anchors);
      }

      await switchChain(chain, activeWallet, bridge);
      setMainComponent(undefined);
      return;
    }

    if (!activeChain) {
      return;
    }

    const activeChainType = {
      name: activeChain.name,
      tag: activeChain.tag,
      symbol:
        getNativeCurrencyFromConfig(
          apiConfig.currencies,
          calculateTypedChainId(activeChain.chainType, activeChain.chainId)
        )?.symbol ?? 'Unknown',
    };

    setMainComponent(
      <ChainListCardWrapper
        chainType="dest"
        onlyCategory={activeChain?.tag}
        fungibleCurrency={fungibleCurrency}
        chains={chainsFromNotes.map((chain) => {
          const currency = getNativeCurrencyFromConfig(
            apiConfig.currencies,
            calculateTypedChainId(chain.chainType, chain.chainId)
          );
          if (!currency) {
            console.error('No currency found for chain', chain.name);
          }

          return {
            name: chain.name,
            tag: chain.tag,
            symbol: currency?.symbol ?? 'Unknown',
          };
        })}
        value={activeChainType}
      />
    );
  }, [
    activeChain,
    activeWallet,
    apiConfig.bridgeByAsset,
    apiConfig.currencies,
    chainsFromNotes,
    fungibleCurrency,
    setMainComponent,
    switchChain,
  ]);

  return {
    availableAmountFromNotes,
    availableNotes,
    chainsFromNotes,
    fungibleCurrency,
    fungiblesFromNotes,
    needSwitchChain,
    setFungibleCurrency,
    handleSwitchToOtherChains,
  };
};

export default useStatesFromNotes;
