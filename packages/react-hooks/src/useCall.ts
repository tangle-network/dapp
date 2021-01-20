import { useEffect, useMemo } from 'react';
import { get, isEmpty } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { ApiRx } from '@polkadot/api';

import { useStore } from '@webb-dapp/react-environment';

import { useIsAppReady } from './useIsAppReady';
import { useApi } from './useApi';
import { CallParams } from './types';

class Tracker {
  private trackerList: Record<string, { refCount: number; subscriber: Subscription }>;

  constructor () {
    this.trackerList = {};
  }

  subscribe (
    api: ApiRx,
    path: string,
    params: CallParams,
    key: string,
    callback: (key: string, valeu: any) => void
  ): void {
    if (isEmpty(api)) return;

    if (!path) return;

    // update tracker list
    if (this.trackerList[key]) {
      this.trackerList[key].refCount += 1;

      return;
    }

    const fn = get(api, path);

    if (!fn) throw new Error(`can't find method:${path} in api`);

    const subscriber = (fn(...params) as Observable<unknown>).subscribe({
      next: (result: any) => callback(key, result)
    });

    // update tracker list
    this.trackerList[key] = {
      refCount: 1,
      subscriber
    };
  }

  unsubscribe (key: string): void {
    if (this.trackerList[key]) {
      this.trackerList[key].refCount -= 1;
    }
  }
}

const tracker = new Tracker();

export function useCall <T> (path: string, params: CallParams = [], options?: {
  cacheKey: string;
}): T | undefined {
  const { api } = useApi();
  const isAppReady = useIsAppReady();
  const { get, set } = useStore('apiQuery');
  const key = useMemo(
    () =>
      `${path}${params.toString() ? '-' + JSON.stringify(params) : ''}${options?.cacheKey ? '-' + options.cacheKey : ''}`,
    [path, params, options]
  );

  // on changes, re-subscribe
  useEffect(() => {
    // check if we have a function & that we are mounted
    if (!isAppReady) return;

    // if path equal __mock, doesn't du anything
    if (path === '__mock') return;

    tracker.subscribe(api, path, params, key, set);

    return (): void => tracker.unsubscribe(key);
  }, [isAppReady, api, path, params, key, set]);

  return get(key);
}
