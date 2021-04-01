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

/**
 * Class representing {[StorageKey, MixerInfo][]} with a native js types
 * */
class MixerGroupEntriesWrapper {
  constructor(private _inner?: MixerGroupEntry[]) {}

  get inner() {
    return this._inner || [];
  }

  /**
   * Tell wither  inner type exists or not
   * */
  get ready() {
    return Boolean(this._inner);
  }

  /**
   * @param {MixerGroupEntry} entry - which equal to  [StorageKey, MixerInfo]
   * @return {MixerGroupItem}
   * */
  public entryIntoItem(entry: MixerGroupEntry): MixerGroupItem {
    return {
      amount: entry[1]['fixed_deposit_size'],

      id: Number((entry[0].toHuman() as any[])[0]),
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

/**
 * UseMixerGroupsEntries
 *  @description   This will issue an RPC call to query.mixer.mixerGroups.entries return wrapper type around [StorageKey, MixerInfo]
 *  @return {MixerGroupEntriesWrapper}
 * */
export const useMixerGroupsEntries = (): MixerGroupEntriesWrapper => {
  const mixerGroups = useCall<Array<MixerGroupEntry>>('query.mixer.mixerGroups.entries', [], undefined, []);
  return useMemo(() => {
    mixerLogger.debug(`MixerGroupEntry `, mixerGroups);
    return new MixerGroupEntriesWrapper(mixerGroups);
  }, [mixerGroups]);
};
