import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  Row,
  SortingFnOption,
} from '@tanstack/react-table';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';

import { StakingItemExternalLinkButton } from '../../../components/LiquidStaking/StakingItemExternalLinkButton';
import {
  LsParachainChainDef,
  LsProtocolId,
  LsProtocolNetworkId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { LiquidStakingItem } from '../../../types/liquidStaking';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';
import formatBn from '../../../utils/formatBn';
import { FetchProtocolEntitiesFn, GetTableColumnsFn } from '../adapter';
import {
  sortCommission,
  sortSelected,
  sortValueStaked,
} from '../columnSorting';
import { fetchVaultsAndStakePools } from '../fetchHelpers';
import RadioInput from '../useLsValidatorSelectionTableColumns';

const DECIMALS = 18;

export type PhalaVaultOrStakePool = {
  // TODO: Is `id` or `accountId` a Substrate address? If so, use `SubstrateAddress` type.
  id: string;
  accountId: string;
  commission: BN;
  totalValueStaked: BN;
  type: 'vault' | 'stake-pool';
};

const fetchVaultOrStakePools: FetchProtocolEntitiesFn<
  PhalaVaultOrStakePool
> = async (rpcEndpoint) => {
  const vaultsAndStakePools = await fetchVaultsAndStakePools(rpcEndpoint);

  return vaultsAndStakePools.map((entity) => {
    const type = entity.type === 'vault' ? 'vault' : 'stake-pool';

    return {
      id: entity.id,
      accountId: entity.accountId,
      commission: entity.commission,
      totalValueStaked: entity.totalValueStaked,
      type,
      itemType: LiquidStakingItem.VAULT_OR_STAKE_POOL,
    };
  });
};

const getTableColumns: GetTableColumnsFn<PhalaVaultOrStakePool> = (
  toggleSortSelectionHandlerRef,
) => {
  const vaultOrStakePoolColumnHelper =
    createColumnHelper<PhalaVaultOrStakePool>();

  // Uses localeCompare for string comparison to ensure
  // proper alphabetical order.
  const sortType = <T extends { type: string }>(rowA: Row<T>, rowB: Row<T>) => {
    const rowAType = rowA.original.type;
    const rowBType = rowB.original.type;

    return rowAType.localeCompare(rowBType);
  };

  return [
    vaultOrStakePoolColumnHelper.accessor('id', {
      header: ({ header }) => {
        toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
        return (
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            Vault/Pool ID
          </Typography>
        );
      },
      cell: (props) => {
        const id = props.getValue();

        return (
          <div className="flex items-center gap-2">
            <RadioInput
              checked={props.row.getIsSelected()}
              onChange={props.row.getToggleSelectedHandler()}
            />

            <div className="flex items-center space-x-1">
              <Avatar
                sourceVariant="address"
                value={props.row.original.accountId}
                theme="substrate"
              />

              <Typography
                variant="body2"
                fw="normal"
                className="truncate text-mono-200 dark:text-mono-0"
              >
                #{id}
              </Typography>

              <CopyWithTooltip
                textToCopy={id}
                isButton={false}
                className="cursor-pointer"
              />
            </div>
          </div>
        );
      },
      // TODO: Avoid casting sorting function.
      sortingFn: sortSelected as SortingFnOption<PhalaVaultOrStakePool>,
    }),
    vaultOrStakePoolColumnHelper.accessor('type', {
      header: ({ header }) => (
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={header.column.getToggleSortingHandler()}
        >
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            Type
          </Typography>
        </div>
      ),
      cell: (props) => {
        const type = props.getValue();

        return (
          <div className="flex items-center justify-center">
            <Chip color={type === 'vault' ? 'green' : 'blue'}>{type}</Chip>
          </div>
        );
      },
      sortingFn: sortType,
    }),
    vaultOrStakePoolColumnHelper.accessor('totalValueStaked', {
      header: ({ header }) => (
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={header.column.getToggleSortingHandler()}
        >
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            Total Staked
          </Typography>
        </div>
      ),
      cell: (props) => (
        <div className="flex items-center justify-center">
          <Typography
            variant="body2"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            {formatBn(props.getValue(), DECIMALS) + ` ${LsToken.PHALA}`}
          </Typography>
        </div>
      ),
      sortingFn: sortValueStaked,
    }),
    vaultOrStakePoolColumnHelper.accessor('commission', {
      header: ({ header }) => (
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={header.column.getToggleSortingHandler()}
        >
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            Commission
          </Typography>
        </div>
      ),
      cell: (props) => (
        <div className="flex items-center justify-center">
          <Typography
            variant="body2"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            {(Number(props.getValue().toString()) / 10000).toFixed(2)}%
          </Typography>
        </div>
      ),
      // TODO: Avoid casting sorting function.
      sortingFn: sortCommission as SortingFnOption<PhalaVaultOrStakePool>,
    }),
    vaultOrStakePoolColumnHelper.display({
      id: 'href',
      header: () => <span></span>,
      cell: (props) => {
        const href = `https://app.phala.network/phala/${props.row.original.type}/${props.row.original.id}`;

        return <StakingItemExternalLinkButton href={href} />;
      },
    }),
  ];
};

const PHALA: LsParachainChainDef<PhalaVaultOrStakePool> = {
  networkId: LsProtocolNetworkId.TANGLE_RESTAKING_PARACHAIN,
  id: LsProtocolId.PHALA,
  name: 'Phala',
  token: LsToken.PHALA,
  chainIconFileName: 'phala',
  currency: 'Pha',
  decimals: DECIMALS,
  rpcEndpoint: 'wss://api.phala.network/ws',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
  ss58Prefix: 30,
  adapter: {
    fetchProtocolEntities: fetchVaultOrStakePools,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<PhalaVaultOrStakePool>;

export default PHALA;
