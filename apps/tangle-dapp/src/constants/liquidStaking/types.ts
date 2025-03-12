import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';

export enum LsToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTR',
  PHALA = 'PHALA',
  TNT = 'TNT',
  T_TNT = 'tTNT',
}

export type LsProtocolDef = {
  networkId: NetworkId;
  name: string;
  chainIconFileName: string;
};

export type LsCardSearchParams = {
  amount: BN;
  protocolId: LsProtocolId;
};

// TODO: These should be moved/managed in libs/ui-components/src/constants/networks.ts and not here. This is just a temporary solution.
export type Network = {
  name: string;
  endpoint: string;
  tokenSymbol: LsToken;
};

export type LsPool = {
  id: number;
  name: string;
  ownerAddress?: SubstrateAddress;
  nominatorAddress?: SubstrateAddress;
  bouncerAddress?: SubstrateAddress;
  validators: SubstrateAddress[];
  totalStaked: BN;
  apyPercentage?: number;
  commissionFractional?: number;
  members: Map<SubstrateAddress, PalletAssetsAssetAccount>;
  iconUrl?: string;
};

export type LsPoolUnstakeRequest = {
  poolName?: string;
  poolId: number;
  poolIconUrl?: string;
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
