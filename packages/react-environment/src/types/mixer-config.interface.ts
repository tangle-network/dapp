export interface TornMixerEntry {
  size: number;
  address: string;
  symbol: string;
  createdAtBlock: number;
}

export interface MixerConfig {
  tornMixers: TornMixerEntry[];
}
