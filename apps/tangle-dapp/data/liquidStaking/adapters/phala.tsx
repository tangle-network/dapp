import { BN, BN_ZERO } from '@polkadot/util';
import {
  AccessorKeyColumnDef,
  createColumnHelper,
  Row,
} from '@tanstack/react-table';

import {
  LsParachainChainDef,
  LsProtocolId,
  LsProtocolType,
  LsToken,
} from '../../../constants/liquidStaking/types';
import {
  LiquidStakingItem,
  PhalaVaultOrStakePool,
} from '../../../types/liquidStaking';
import { SubstrateAddress } from '../../../types/utils';
import assertSubstrateAddress from '../../../utils/assertSubstrateAddress';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';
import { ValidatorCommon } from '../adapter';
import {
  fetchChainDecimals,
  fetchMappedIdentityNames,
  fetchMappedValidatorsCommission,
  fetchMappedValidatorsTotalValueStaked,
  fetchTokenSymbol,
} from '../fetchHelpers';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import RadioInput from '../useLsValidatorSelectionTableColumns';
import formatBn from '../../../utils/formatBn';
import { StakingItemExternalLinkButton } from '../../../components/LiquidStaking/StakingItemExternalLinkButton';

const SS58_PREFIX = 0;

export type PolkadotValidator = ValidatorCommon & {
  address: SubstrateAddress<typeof SS58_PREFIX>;
  identity: string;
  commission: BN;
  apy?: number;
  totalValueStaked: BN;
};

const fetchValidators = async (
  rpcEndpoint: string,
): Promise<PolkadotValidator[]> => {
  const [
    validators,
    mappedIdentityNames,
    mappedTotalValueStaked,
    mappedCommission,
  ] = await Promise.all([
    fetchValidators(rpcEndpoint),
    fetchMappedIdentityNames(rpcEndpoint),
    fetchMappedValidatorsTotalValueStaked(rpcEndpoint),
    fetchMappedValidatorsCommission(rpcEndpoint),
    fetchChainDecimals(rpcEndpoint),
    fetchTokenSymbol(rpcEndpoint),
  ]);

  return validators.map((address) => {
    const identityName = mappedIdentityNames.get(address.toString());
    const totalValueStaked = mappedTotalValueStaked.get(address.toString());
    const commission = mappedCommission.get(address.toString());

    return {
      id: address.toString(),
      address: assertSubstrateAddress(address.toString(), SS58_PREFIX),
      identity: identityName ?? address.toString(),
      totalValueStaked: totalValueStaked ?? BN_ZERO,
      apy: 0,
      commission: commission ?? BN_ZERO,
      itemType: LiquidStakingItem.VALIDATOR,
      href: `https://polkadot.subscan.io/account/${address.toString()}`,
    };
  });
};

const getTableColumns = (
  toggleSortSelectionHandlerRef: React.MutableRefObject<
    ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void) | null
  >,
): AccessorKeyColumnDef<PolkadotValidator>[] => {
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
    vaultOrStakePoolColumnHelper.accessor('vaultOrStakePoolID', {
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
        const accountID = props.row.original.vaultOrStakePoolAccountID;

        return (
          <div className="flex items-center gap-2">
            <RadioInput
              checked={props.row.getIsSelected()}
              onChange={props.row.getToggleSelectedHandler()}
            />

            <div className="flex items-center space-x-1">
              <Avatar
                sourceVariant="address"
                value={accountID}
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
            {formatBn(props.getValue(), props.row.original.chainDecimals) +
              ` ${props.row.original.chainTokenSymbol}`}
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
      sortingFn: sortCommission as SortingFnOption<PhalaVaultOrStakePool>,
    }),
    vaultOrStakePoolColumnHelper.accessor('href', {
      header: () => <span></span>,
      cell: (props) => {
        return <StakingItemExternalLinkButton href={props.getValue()} />;
      },
    }),
  ];
};

const PHALA: LsParachainChainDef = {
  type: LsProtocolType.TANGLE_RESTAKING_PARACHAIN,
  id: LsProtocolId.PHALA,
  name: 'Phala',
  token: LsToken.PHALA,
  chainIconFileName: 'phala',
  currency: 'Pha',
  decimals: 18,
  rpcEndpoint: 'wss://api.phala.network/ws',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
  ss58Prefix: 30,
  adapter: {
    fetchValidators,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<PhalaVaultOrStakePool>;

export default PHALA;
