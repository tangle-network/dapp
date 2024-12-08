import {
  PalletAssetsAssetAccount,
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';
import { Network as TangleNetwork } from '@webb-tools/webb-ui-components/constants/networks';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

import {
  LsNetworkEntityAdapter,
  ProtocolEntity,
} from '../../data/liquidStaking/adapter';
import { CrossChainTimeUnit } from '../../utils/CrossChainTime';

export type LsParachainChainId =
  | LsProtocolId.POLKADOT
  | LsProtocolId.PHALA
  | LsProtocolId.MOONBEAM
  | LsProtocolId.ASTAR
  | LsProtocolId.MANTA;

export type LsTangleNetworkId =
  | LsProtocolId.TANGLE_MAINNET
  | LsProtocolId.TANGLE_TESTNET
  | LsProtocolId.TANGLE_LOCAL;

export enum LsToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTR',
  PHALA = 'PHALA',
  TNT = 'TNT',
  T_TNT = 'tTNT',
}

export type LsParachainToken =
  | LsToken.DOT
  | LsToken.GLMR
  | LsToken.MANTA
  | LsToken.ASTAR
  | LsToken.PHALA;

type ProtocolDefCommon = {
  name: string;
  decimals: number;
  timeUnit: CrossChainTimeUnit;
  unstakingPeriod: number;
  chainIconFileName: string;
};

export enum LsNetworkId {
  TANGLE_LOCAL,
  TANGLE_TESTNET,
  TANGLE_MAINNET,
  TANGLE_RESTAKING_PARACHAIN,
}

export interface LsTangleNetworkDef extends ProtocolDefCommon {
  networkId:
    | LsNetworkId.TANGLE_MAINNET
    | LsNetworkId.TANGLE_TESTNET
    | LsNetworkId.TANGLE_LOCAL;
  id: LsTangleNetworkId;
  token: LsToken.TNT | LsToken.T_TNT;
  rpcEndpoint: string;
  ss58Prefix:
    | typeof TANGLE_MAINNET_NETWORK.ss58Prefix
    | typeof TANGLE_TESTNET_NATIVE_NETWORK.ss58Prefix
    | typeof TANGLE_LOCAL_DEV_NETWORK.ss58Prefix;
  tangleNetwork: TangleNetwork;
}

export interface LsParachainChainDef<T extends ProtocolEntity = ProtocolEntity>
  extends ProtocolDefCommon {
  networkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN;
  id: LsParachainChainId;
  name: string;
  token: LsParachainToken;
  currency: ParachainCurrency;
  rpcEndpoint: string;
  ss58Prefix: number;
  adapter: LsNetworkEntityAdapter<T>;
}

export type LsProtocolDef = LsParachainChainDef | LsTangleNetworkDef;

export type LsCardSearchParams = {
  amount: BN;
  protocolId: LsProtocolId;
};

// TODO: These should be moved/managed in libs/webb-ui-components/src/constants/networks.ts and not here. This is just a temporary solution.
export type Network = {
  name: string;
  endpoint: string;
  tokenSymbol: LsToken;
  chainType: NetworkType;
};

export enum NetworkType {
  RELAY_CHAIN = 'Relay Chain',
  PARACHAIN = 'Parachain',
}

// TODO: Temporary manual override until the Parachain types are updated.
export type ParachainCurrency = TanglePrimitivesCurrencyTokenSymbol['type'];
// | Exclude<TanglePrimitivesCurrencyTokenSymbol['type'], 'Bnc'>
// | 'Tnt';

export type LsParachainCurrencyKey =
  | { lst: ParachainCurrency }
  | { Native: ParachainCurrency };

export type LsParachainTimeUnit = TanglePrimitivesTimeUnit['type'];

export type LsParachainSimpleTimeUnit = {
  value: number;
  unit: LsParachainTimeUnit;
};

export type LsNetwork = {
  id: LsNetworkId;
  networkName: string;
  chainIconFileName: string;
  defaultProtocolId: LsProtocolId;
  protocols: LsProtocolDef[];
};

export type LsPool = {
  id: number;
  name?: string;
  ownerAddress?: SubstrateAddress;
  nominatorAddress?: SubstrateAddress;
  bouncerAddress?: SubstrateAddress;
  validators: SubstrateAddress[];
  totalStaked: BN;
  apyPercentage?: number;
  commissionFractional?: number;
  members: Map<SubstrateAddress, PalletAssetsAssetAccount>;
  protocolId: LsProtocolId;
  iconUrl?: string;
};

export type LsPoolUnstakeRequest = {
  poolName?: string;
  poolId: number;
  poolIconUrl?: string;
  poolProtocolId: LsProtocolId;
  decimals: number;
  token: LsToken;
  unlockEra: number;
  erasLeftToUnlock?: number;
  isReadyToWithdraw: boolean;

  /**
   * The underlying stake tokens amount represented by the unlock
   * request.
   */
  amount: BN;
};

export type LsPoolDisplayName = `${string}#${number}`;
