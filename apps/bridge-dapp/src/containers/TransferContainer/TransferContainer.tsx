import { useBridge, useCurrencies } from '@webb-tools/react-hooks';
import { TransferCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { forwardRef, useCallback, useMemo } from 'react';
import { TransferContainerProps } from './types';

export const TransferContainer = forwardRef<
  HTMLDivElement,
  TransferContainerProps
>((props, ref) => {
  const { governedCurrencies, wrappableCurrencies } = useCurrencies();

  const { governedCurrency, setGovernedCurrency } = useBridge();

  const bridgingAssets = useMemo((): AssetType[] => {
    return Object.values(governedCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
      };
    });
  }, [governedCurrencies]);

  const handleGovernedTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(governedCurrencies).find(
        (currency) => currency.view.symbol === newToken.symbol
      );
      if (selectedToken) {
        setGovernedCurrency(selectedToken);
      }
    },
    [governedCurrencies, setGovernedCurrency]
  );

  const selectedBridgingAsset = useMemo<AssetType | undefined>(() => {
    if (!governedCurrency) {
      return undefined;
    }
    return {
      symbol: governedCurrency.view.symbol,
      name: governedCurrency.view.name,
      balance: availableAmount,
    };
  }, [availableAmount, governedCurrency]);

  return (
    <div>
      <TransferCard />
    </div>
  );
});
