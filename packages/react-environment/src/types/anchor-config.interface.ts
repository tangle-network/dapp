import { ChainId } from '@webb-dapp/apps/configs';

export type ChainAddressConfig = { [key in ChainId]?: string };

export type AnchorConfigEntry = {
  amount: string;
  anchorAddresses: ChainAddressConfig;
};
