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

export type GetTableColumnsFn<T extends ProtocolEntity> = (
  toggleSortSelectionHandlerRef: MutableRefObject<
    ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void) | null
  >,
) => ColumnDef<T, any>[];

export type LsAdapterDef<T extends ProtocolEntity = ProtocolEntity> = {
  fetchProtocolEntities: FetchProtocolEntitiesFn<T>;
  getTableColumns: GetTableColumnsFn<T>;
};
