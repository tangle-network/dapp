import { HexString } from '@polkadot/util/types';

import ASTAR from '../../data/liquidStaking/adapters/astar';
import CHAINLINK from '../../data/liquidStaking/adapters/chainlink';
import LIVEPEER from '../../data/liquidStaking/adapters/livePeer';
import MANTA from '../../data/liquidStaking/adapters/manta';
import MOONBEAM from '../../data/liquidStaking/adapters/moonbeam';
import PHALA from '../../data/liquidStaking/adapters/phala';
import POLKADOT from '../../data/liquidStaking/adapters/polkadot';
import POLYGON from '../../data/liquidStaking/adapters/polygon';
import THE_GRAPH from '../../data/liquidStaking/adapters/theGraph';
import { IS_PRODUCTION_ENV } from '../env';
import {
  LsLiquifierProtocolDef,
  LsLiquifierProtocolId,
  LsParachainChainDef,
  LsParachainChainId,
  LsParachainToken,
  LsProtocolDef,
  LsProtocolId,
  LsProtocolNetworkId,
  LsProtocolTypeMetadata,
  LsToken,
} from './types';

// TODO: Deploy to Sepolia and update the addresses.
export const LS_REGISTRY_ADDRESS = IS_PRODUCTION_ENV ? '0x' : '0x';

/**
 * Development only. Sepolia testnet contracts that were
 * deployed to test the liquifier functionality. These contracts
 * use dummy data.
 */
export const SEPOLIA_TESTNET_CONTRACTS = {
  LIQUIFIER: '0x55D942dC55b8b3bEE51C964c4985C46C7DF98Be0',
  ERC20: '0x2eE951c2d215ba1b3E0DF20764c96a0bC7809F41',
  // Use the same address as the dummy ERC20 contract.
  TG_TOKEN: '0x2eE951c2d215ba1b3E0DF20764c96a0bC7809F41',
  UNLOCKS: '0x32d70bC73d0965209Cf175711b010dE6A7650c2B',
} as const satisfies Record<string, HexString>;

export const LS_PARACHAIN_CHAIN_MAP: Record<
  LsParachainChainId,
  LsParachainChainDef
> = {
  [LsProtocolId.POLKADOT]: POLKADOT,
  [LsProtocolId.PHALA]: PHALA,
  [LsProtocolId.MOONBEAM]: MOONBEAM,
  [LsProtocolId.ASTAR]: ASTAR,
  [LsProtocolId.MANTA]: MANTA,
};

export const LS_LIQUIFIER_PROTOCOL_MAP: Record<
  LsLiquifierProtocolId,
  LsLiquifierProtocolDef
> = {
  [LsProtocolId.CHAINLINK]: CHAINLINK,
  [LsProtocolId.THE_GRAPH]: THE_GRAPH,
  [LsProtocolId.LIVEPEER]: LIVEPEER,
  [LsProtocolId.POLYGON]: POLYGON,
};

export const LS_PROTOCOLS: LsProtocolDef[] = [
  ...Object.values(LS_PARACHAIN_CHAIN_MAP),
  ...Object.values(LS_LIQUIFIER_PROTOCOL_MAP),
];

export const LS_LIQUIFIER_PROTOCOL_IDS = [
  LsProtocolId.CHAINLINK,
  LsProtocolId.THE_GRAPH,
  LsProtocolId.LIVEPEER,
  LsProtocolId.POLYGON,
] as const satisfies LsLiquifierProtocolId[];

export const LS_PARACHAIN_CHAIN_IDS = Object.values(LsProtocolId).filter(
  (value): value is LsParachainChainId =>
    typeof value !== 'string' &&
    !LS_LIQUIFIER_PROTOCOL_IDS.includes(value as LsLiquifierProtocolId),
) satisfies LsParachainChainId[];

export const LS_PARACHAIN_TOKENS = [
  LsToken.DOT,
  LsToken.GLMR,
  LsToken.MANTA,
  LsToken.ASTAR,
  LsToken.PHALA,
  LsToken.TNT,
] as const satisfies LsParachainToken[];

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LST_PREFIX = 'tg';

export const LS_ETHEREUM_MAINNET_LIQUIFIER: LsProtocolTypeMetadata = {
  type: LsProtocolNetworkId.ETHEREUM_MAINNET_LIQUIFIER,
  networkName: 'Ethereum Mainnet',
  chainIconFileName: 'ethereum',
  protocols: [CHAINLINK, THE_GRAPH, LIVEPEER, POLYGON],
};

export const LS_TANGLE_RESTAKING_PARACHAIN: LsProtocolTypeMetadata = {
  type: LsProtocolNetworkId.TANGLE_RESTAKING_PARACHAIN,
  networkName: 'Tangle Restaking Parachain',
  chainIconFileName: 'tangle',
  protocols: [POLKADOT, PHALA, MOONBEAM, ASTAR, MANTA],
};

export const LS_NETWORKS: LsProtocolTypeMetadata[] = [
  LS_ETHEREUM_MAINNET_LIQUIFIER,
  LS_TANGLE_RESTAKING_PARACHAIN,
];
