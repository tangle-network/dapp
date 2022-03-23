/*
import { useStore } from '@webb-dapp/react-environment';
import { LoggerService } from '@nepoche/app-util';
import { get, isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { Observable, Subscription } from 'rxjs';

import { ApiRx } from '@polkadot/api';

import { CallParams } from './types';
import { useApi } from './useApi';
import { useIsAppReady } from './useIsAppReady';

const logger = LoggerService.get('App');

class Tracker {
  private trackerList: Record<string, { refCount: number; subscriber: Subscription }>;

  constructor() {
    this.trackerList = {};
  }

  subscribe(
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
      next: (result: any) => callback(key, result),
    });

    // update tracker list
    this.trackerList[key] = {
      refCount: 1,
      subscriber,
    };
  }

  unsubscribe(key: string): void {
    if (this.trackerList[key]) {
      this.trackerList[key].refCount -= 1;
    }
  }
}

const tracker = new Tracker();

export function useCall<T>(
  path: string,
  params: CallParams = [],
  options?: {
    cacheKey: string;
  },
  fallback?: T,
  canCall?: () => boolean
): T | undefined {
  const callable = !canCall ? true : canCall();
  const { api } = useApi();
  const isAppReady = useIsAppReady();
  const { get: _get, set } = useStore('apiQuery');
  const get: typeof _get = (...args) => {
    try {
      if (!callable) {
        return fallback;
      }
      return _get(...args);
    } catch (e) {
      return fallback;
    }
  };
  const key = useMemo(
    () =>
      `${path}${params.toString() ? '-' + JSON.stringify(params) : ''}${
        options?.cacheKey ? '-' + options.cacheKey : ''
      }`,
    [path, params, options]
  );

  // on changes, re-subscribe
  useEffect(() => {
    let isSubscribed = true;
    if (!callable) {
      return;
    }
    // check if we have a function & that we are mounted
    if (!isAppReady) return;

    // if path equal __mock, doesn't du anything
    if (path === '__mock') return;
    try {
      tracker.subscribe(api, path, params, key, set);
    } catch (e) {
      logger.error(' useCall ', e);
      return undefined;
    }

    return (): void => {
      try {
        tracker.unsubscribe(key);
      } catch (e) {
        logger.error(' useCall ', e);
      }
    };
  }, [isAppReady, api, path, params, key, set, callable]);

  return get(key);
}
*/
export {};
