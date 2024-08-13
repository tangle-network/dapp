import { HexString } from '@polkadot/util/types';

export type Erc20TokenDef = {
  id: Erc20TokenId;
  name: string;
  address: HexString;
  liquifierAdapterAddress: HexString;
};

export enum Erc20TokenId {
  Chainlink,
}

const ChainlinkTokenDef: Erc20TokenDef = {
  id: Erc20TokenId.Chainlink,
  name: 'Chainlink',
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
};

export const ERC20_TOKEN_MAP: Record<Erc20TokenId, Erc20TokenDef> = {
  [Erc20TokenId.Chainlink]: ChainlinkTokenDef,
};
