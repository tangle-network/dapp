import { InternalChainId } from '@webb-dapp/apps/configs';

export type ChainAddressConfig = { [key in InternalChainId]?: string };

export type AnchorConfigEntry = {
  amount: string;
  /*EVM based*/
  anchorAddresses: ChainAddressConfig;
  /*Substrate based*/
  anchorTreeIds: ChainAddressConfig;
};
