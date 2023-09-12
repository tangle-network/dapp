import { NumberParam, useQueryParams } from 'use-query-params';
import { DEST_CHAIN_KEY, SOURCE_CHAIN_KEY } from '../../../../../constants';
import useAmountWithRoute from '../../../../../hooks/useAmountWithRoute';
import useCurrenciesFromRoute from '../../../../../hooks/useCurrenciesFromRoute';
import useDefaultChainAndPool from '../../../../../hooks/useDefaultChainAndPool';
import objectToSearchString from '../../../../../utils/objectToSearchString';

function useWatchSearchParams() {
  const { allCurrencies, fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const [query] = useQueryParams(
    {
      [SOURCE_CHAIN_KEY]: NumberParam,
      [DEST_CHAIN_KEY]: NumberParam,
    },
    { objectToSearchString }
  );

  const {
    [SOURCE_CHAIN_KEY]: srcTypedChainId,
    [DEST_CHAIN_KEY]: destTypedChainId,
  } = query;

  const [amount, setAmount] = useAmountWithRoute();

  useDefaultChainAndPool();

  return {
    allCurrencies,
    amount,
    destTypedChainId: destTypedChainId ?? undefined,
    fungibleCfg,
    onAmountChange: setAmount,
    srcTypedChainId: srcTypedChainId ?? undefined,
    wrappableCfg,
  };
}

export default useWatchSearchParams;
