import { ColumnDef } from '@tanstack/react-table';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { MutableRefObject } from 'react';

import {
  Collator,
  Dapp,
  PhalaVaultOrStakePool,
} from '../../types/liquidStaking';
import { PolkadotValidator } from './adapters/polkadot';

export type NetworkEntityCommon = {
  href?: string;
};

export type NetworkEntity =
  | PolkadotValidator
  | PhalaVaultOrStakePool
  | Dapp
  | Collator;

export enum NetworkEntityType {
  POLKADOT_VALIDATOR,
  PHALA_VAULT_OR_STAKE_POOL,
}

export type FetchNetworkEntitiesFn<T extends NetworkEntity> = (
  rpcEndpoint: string,
) => PromiseOrT<T[]>;

export type GetTableColumnsFn<T extends NetworkEntity> = (
  toggleSortSelectionHandlerRef: MutableRefObject<
    ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void) | null
  >,
) => ColumnDef<T, any>[];

export type LsAdapterDef<T extends NetworkEntity = NetworkEntity> = {
  fetchNetworkEntities: FetchNetworkEntitiesFn<T>;
  getTableColumns: GetTableColumnsFn<T>;
};
