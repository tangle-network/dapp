import { EventBus } from '@webb-tools/app-util';

import { Note } from './note';

export type DepositPayload<T extends Note = Note, DepositParams = unknown> = {
  note: T;
  params: DepositParams;
};
export type MixerDepositEvents = {
  error: string;
  ready: undefined;
};
export type DespotStates = 'ideal' | 'generating-note' | 'depositing';

export type MixerSize = {
  id: number | string;
  title: string;
};

export abstract class MixerDeposit<
  T = any,
  K extends DepositPayload = DepositPayload<any>
> extends EventBus<MixerDepositEvents> {
  constructor(protected inner: T) {
    super();
  }

  abstract generateNote(mixerId: number | string, chainId?: number | string): Promise<K>;

  abstract deposit(depositPayload: K): Promise<void>;

  loading: DespotStates = 'ideal';

  abstract getSizes(): Promise<MixerSize[]>;
}
