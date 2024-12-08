import { ColumnDef } from '@tanstack/react-table';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { MutableRefObject } from 'react';

import { AstarDapp } from './adapters/astar';
import { MoonbeamCollator } from './adapters/moonbeam';
import { PhalaVaultOrStakePool } from './adapters/phala';
import { PolkadotValidator } from './adapters/polkadot';

export type ProtocolEntity =
  | PolkadotValidator
  | PhalaVaultOrStakePool
  | AstarDapp
  | MoonbeamCollator;

export enum NetworkEntityType {
  POLKADOT_VALIDATOR,
  PHALA_VAULT_OR_STAKE_POOL,
}

export type FetchProtocolEntitiesFn<T extends ProtocolEntity> = (
  rpcEndpoint: string,
) => PromiseOrT<T[]>;

// Note that it's acceptable to use `any` for the return type here,
// since it won't affect our type safety of our logic, only TanStack's.
// In fact, they also use `any` internally, likely because of the complexity
// of the different possible column types.
export type GetTableColumnsFn<T extends ProtocolEntity> = (
  toggleSortSelectionHandlerRef: MutableRefObject<
    ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void) | null
  >,
) => ColumnDef<T, any>[];

export type LsNetworkEntityAdapter<T extends ProtocolEntity = ProtocolEntity> =
  {
    fetchProtocolEntities: FetchProtocolEntitiesFn<T>;
    getTableColumns: GetTableColumnsFn<T>;
  };
