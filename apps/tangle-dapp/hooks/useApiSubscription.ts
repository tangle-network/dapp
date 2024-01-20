import { Account, WebbApiProvider } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import assert from 'assert';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export type ObservableFactory<T> = (
  api: WebbApiProvider<unknown>,
  activeAccount: Account<unknown>
) => Observable<T>;

/** @internal */
export default function useApiSubscription<T>(
  initialObservableFactory: ObservableFactory<T>,
  defaultValue: T
): [T, (observableFactory: ObservableFactory<T>) => void] {
  const { activeAccount, activeApi, activeChain, isConnecting, loading } =
    useWebContext();

  const [value, setValue] = useState(defaultValue);

  const [getObservable, updateObservableFactory] = useState<
    ObservableFactory<T>
  >(initialObservableFactory);

  useEffect(() => {
    // Still loading or connecting, don't attempt to subscribe.
    if (!activeChain || activeApi === undefined || isConnecting || loading) {
      return;
    }

    assert(
      activeAccount !== null,
      'Active account should be set if not loading or connecting'
    );

    const typedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.id
    );

    const nativeCurrency = getNativeCurrencyFromConfig(
      activeApi.config.currencies,
      typedChainId
    );

    // TODO: Better error handling.
    if (nativeCurrency === undefined) {
      console.warn('Not native currency found for chain ', activeChain);

      return;
    }

    const subscription = getObservable(activeApi, activeAccount).subscribe(
      (value) => setValue(value)
    );

    return () => subscription.unsubscribe();
  }, [
    activeChain,
    activeApi,
    activeAccount,
    isConnecting,
    loading,
    setValue,
    initialObservableFactory,
    getObservable,
  ]);

  return [value, updateObservableFactory];
}
