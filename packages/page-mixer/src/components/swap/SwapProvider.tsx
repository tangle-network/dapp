import React, {
  memo,
  createContext,
  FC,
  PropsWithChildren,
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import { u32 } from '@polkadot/types';
import { Observable } from 'rxjs';
import { ITuple } from '@polkadot/types/types';
import { map } from 'rxjs/operators';
import { CurrencyId, Balance } from '@webb-tools/types/interfaces';
import { Token, TokenPair, FixedPointNumber, currencyId2Token } from '@webb-tools/sdk-core';

import { useApi } from '@webb-dapp/react-hooks';

export type Fee = unknown;
export type SwapTradeMode = unknown;
export type TradeParameters = unknown;

export interface PoolData {
  supplyCurrency: CurrencyId;
  targetCurrency: CurrencyId;
  supplySize: number;
  targetSize: number;
}

interface ContextData {
  acceptSlippage: number;
  setAcceptSlippage: (value: number) => void;
  changeFlag: ChangeFlag;
  exchangeFee: Fee;
  enableTokenPairs: TokenPair[];
  availableTokens: Set<Token>;
  tradeMode: SwapTradeMode;
  setTradeMode: Dispatch<SetStateAction<SwapTradeMode>>;
  getTradeParameters: (
    acceptSlippage: number,
    inputAmount: number,
    inputCurrencyId: CurrencyId,
    outputAmount: number,
    outputCurrency: CurrencyId,
    tradeMode: SwapTradeMode
  ) => Observable<TradeParameters>;
}

class ChangeFlag {
  private _value: boolean;

  constructor(defaultValue: boolean) {
    this._value = defaultValue;
  }

  static create(value: boolean): ChangeFlag {
    return new ChangeFlag(value);
  }

  public update(value: boolean): void {
    this._value = value;
  }

  get value(): boolean {
    const _value = this._value;

    if (_value) {
      this._value = false;
    }

    return _value;
  }
}

export const SwapContext = createContext<ContextData>({} as ContextData);

export const SwapProvider: FC<PropsWithChildren<{}>> = memo(({ children }) => {
  const { api } = useApi();
  const [tradeMode, setTradeMode] = useState<SwapTradeMode>('EXACT_INPUT');
  const [acceptSlippage, _setAcceptSlippage] = useState<number>(0.005);
  const changeFlag = useRef<ChangeFlag>(ChangeFlag.create(false));

  const setAcceptSlippage = useCallback(
    (value: number) => {
      _setAcceptSlippage(value);
      changeFlag.current.update(true);
    },
    [_setAcceptSlippage]
  );

  const exchangeFee = useMemo<Fee>((): Fee => {
    if (!api) return {} as Fee;

    const exchangeFee = (api.consts.dex.getExchangeFee as unknown) as [u32, u32];

    return {
      denominator: new FixedPointNumber(exchangeFee[1].toString()),
      numerator: new FixedPointNumber(exchangeFee[0].toString()),
    };
  }, [api]);

  const enableTokenPairs = useMemo((): TokenPair[] => {
    if (!api) return [];

    return SwapTrade.getAvailableTokenPairs(api);
  }, [api]);

  const maxTradePathLength = useMemo((): number => {
    if (!api) return 0;

    return parseInt(((api.consts.dex.tradingPathLimit as unknown) as u32).toString());
  }, [api]);

  const availableTokens = useMemo<Set<Token>>((): Set<Token> => {
    const result: Set<Token> = new Set();

    enableTokenPairs.forEach((item) => {
      item.getPair().forEach((token) => result.add(token));
    });

    return result;
  }, [enableTokenPairs]);

  const getTradeParameters = useCallback(
    (
      acceptSlippage: number,
      inputAmount: number,
      inputCurrencyId: CurrencyId,
      outputAmount: number,
      outputCurrency: CurrencyId,
      tradeMode: SwapTradeMode
    ): Observable<TradeParameters> => {
      const input = currencyId2Token(inputCurrencyId).clone({
        amount: new FixedPointNumber(inputAmount),
      });

      const output = currencyId2Token(outputCurrency).clone({
        amount: new FixedPointNumber(outputAmount),
      });

      const swap = new SwapTrade({
        acceptSlippage: new FixedPointNumber(acceptSlippage),
        availableTokenPairs: enableTokenPairs,
        fee: exchangeFee,
        input,
        maxTradePathLength,
        mode: tradeMode,
        output,
      });

      const usedTokenPairs = swap.getTradeTokenPairsByPaths();

      return api
        .queryMulti<ITuple<[Balance, Balance]>[]>(
          usedTokenPairs.map((item) => [api.query.dex.liquidityPool, item.toChainData()])
        )
        .pipe(
          map((result) => {
            const pools = SwapTrade.convertLiquidityPoolsToTokenPairs(usedTokenPairs, result);
            const parameters = swap.getTradeParameters(pools);
            const { path } = parameters;

            if (path.length >= 2) {
              const tailPair = new TokenPair(path[path.length - 1], path[path.length - 2]);
              const tailPairPool = pools.find((item): boolean => item.isEqual(tailPair));

              if (tailPairPool) {
                // check output is sufficient in pool
                console.log(parameters.midPrice.toString());

                if (parameters.midPrice.isLessOrEqualTo(FixedPointNumber.ZERO)) {
                  throw new Error('Insufficient token in the pool.');
                }
              }
            }

            return parameters;
          })
        );
    },
    [enableTokenPairs, exchangeFee, maxTradePathLength, api]
  );

  return (
    <SwapContext.Provider
      value={{
        acceptSlippage,
        availableTokens,
        changeFlag: changeFlag.current,
        enableTokenPairs,
        exchangeFee,
        getTradeParameters,
        setAcceptSlippage,
        setTradeMode,
        tradeMode,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
});

SwapProvider.displayName = 'SwapProvider';
