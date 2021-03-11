import { useCall } from '@webb-dapp/react-hooks';
import { Balance, MixerInfo } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

import { StorageKey } from '@polkadot/types';

import { mixerLogger } from './mixer-logger';

export type MixerGroupItem = {
  id: number;
  amount: Balance;
};
export type MixerGroupEntry = [StorageKey, MixerInfo];

class MixerInfoWrapper {
  constructor(private _inner: MixerGroupEntry[]) {}

  get inner() {
    return this._inner;
  }

  public entryIntoItem(entry: MixerGroupEntry): MixerGroupItem {
    return {
      amount: entry[1]['fixed_deposit_size'],
      id: Number(entry[0].toHuman()[0]),
    };
  }

  get items(): MixerGroupItem[] {
    return this.inner.map(this.entryIntoItem);
  }

  getSelect(item: MixerGroupItem) {
    return this.inner.find((mixerGroupEntry) => {
      const number = this.entryIntoItem(mixerGroupEntry);
      return number.toString() === item.amount.toString();
    });
  }
}

export const useMixerInfos = (): MixerInfoWrapper => {
  const mixerGroups = useCall<Array<MixerGroupEntry>>('query.mixer.mixerGroups.entries', [], undefined, []);

  return useMemo(() => {
    mixerLogger.debug(`MixerInfo `, mixerGroups);
    return new MixerInfoWrapper(mixerGroups || []);
  }, [mixerGroups]);
};
