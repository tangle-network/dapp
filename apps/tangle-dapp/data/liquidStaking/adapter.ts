import { ColumnDef } from '@tanstack/react-table';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';

import {
  Collator,
  Dapp,
  PhalaVaultOrStakePool,
} from '../../types/liquidStaking';
import { PolkadotValidator } from './adapters/polkadot';

export type ValidatorCommon = {
  href?: string;
};

export type AnyValidator =
  | PolkadotValidator
  | PhalaVaultOrStakePool
  | Dapp
  | Collator;

export type LsAdapterDef<T = AnyValidator> = {
  fetchValidators: (rpcEndpoint: string) => PromiseOrT<T[]>;
  getTableColumns: (
    toggleSortSelectionHandlerRef: React.MutableRefObject<
      | ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void)
      | null
    >,
  ) => ColumnDef<T>[];
};
