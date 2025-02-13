import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
  Network as TangleNetwork,
} from '@tangle-network/webb-ui-components/constants/networks';
import type { SubstrateAddress } from '@tangle-network/webb-ui-components/types/address';

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

type ProtocolDefCommon = {
  name: string;
  decimals: number;
  unstakingPeriod: number;
  chainIconFileName: string;
};

export enum LsNetworkId {
  TANGLE_LOCAL,
  TANGLE_TESTNET,
  TANGLE_MAINNET,
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

export type LsProtocolDef = LsTangleNetworkDef;

export type LsCardSearchParams = {
  amount: BN;
  protocolId: LsProtocolId;
};

// TODO: These should be moved/managed in libs/webb-ui-components/src/constants/networks.ts and not here. This is just a temporary solution.
export type Network = {
  name: string;
  endpoint: string;
  tokenSymbol: LsToken;
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
