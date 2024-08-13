import { HexString } from '@polkadot/util/types';

export type LsErc20TokenDef = {
  id: LsErc20TokenId;
  name: string;
  address: HexString;
  liquifierAdapterAddress: HexString;
};

export enum LsErc20TokenId {
  Chainlink,
}

const ChainlinkErc20TokenDef: LsErc20TokenDef = {
  id: LsErc20TokenId.Chainlink,
  name: 'Chainlink',
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
};

export const LS_ERC20_TOKEN_MAP: Record<LsErc20TokenId, LsErc20TokenDef> = {
  [LsErc20TokenId.Chainlink]: ChainlinkErc20TokenDef,
};
