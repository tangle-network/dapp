import { BN, BN_ZERO } from '@polkadot/util';
import { createColumnHelper, SortingFnOption } from '@tanstack/react-table';
import {
  Avatar,
  CheckBox,
  CopyWithTooltip,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';

import { StakingItemExternalLinkButton } from '../../../components/LiquidStaking/StakingItemExternalLinkButton';
import {
  LsParachainChainDef,
  LsProtocolId,
  LsProtocolType,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { LiquidStakingItem } from '../../../types/liquidStaking';
import { SubstrateAddress } from '../../../types/utils';
import assertSubstrateAddress from '../../../utils/assertSubstrateAddress';
import calculateCommission from '../../../utils/calculateCommission';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';
import formatBn from '../../../utils/formatBn';
import { GetTableColumnsFn, NetworkEntityCommon } from '../adapter';
import {
  sortCommission,
  sortSelected,
  sortValueStaked,
} from '../columnSorting';
import {
  fetchChainDecimals,
  fetchMappedIdentityNames,
  fetchMappedValidatorsCommission,
  fetchMappedValidatorsTotalValueStaked,
  fetchTokenSymbol,
} from '../fetchHelpers';

const SS58_PREFIX = 0;
const DECIMALS = 18;
const TOKEN_SYMBOL = 'DOT';

export type PolkadotValidator = NetworkEntityCommon & {
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

const getTableColumns: GetTableColumnsFn<PolkadotValidator> = (
  toggleSortSelectionHandlerRef,
) => {
  const validatorColumnHelper = createColumnHelper<PolkadotValidator>();

  return [
    validatorColumnHelper.accessor('address', {
      header: ({ header }) => {
        toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
        return (
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            Validator
          </Typography>
        );
      },
      cell: (props) => {
        const address = props.getValue();
        const identity = props.row.original.identity ?? address;

        return (
          <div className="flex items-center gap-2">
            <CheckBox
              wrapperClassName="!block !min-h-auto cursor-pointer"
              className="cursor-pointer"
              isChecked={props.row.getIsSelected()}
              onChange={props.row.getToggleSelectedHandler()}
            />

            <div className="flex items-center space-x-1">
              <Avatar
                sourceVariant="address"
                value={address}
                theme="substrate"
              />

              <Typography
                variant="body2"
                fw="normal"
                className="truncate text-mono-200 dark:text-mono-0"
              >
                {identity === address ? shortenString(address, 8) : identity}
              </Typography>

              <CopyWithTooltip
                textToCopy={address}
                isButton={false}
                className="cursor-pointer"
              />
            </div>
          </div>
        );
      },
      // TODO: Avoid casting sorting function.
      sortingFn: sortSelected as SortingFnOption<PolkadotValidator>,
    }),
    validatorColumnHelper.accessor('totalValueStaked', {
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
            {formatBn(props.getValue(), DECIMALS) + ` ${TOKEN_SYMBOL}`}
          </Typography>
        </div>
      ),
      sortingFn: sortValueStaked,
    }),
    validatorColumnHelper.accessor('commission', {
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
            {calculateCommission(props.getValue()).toFixed(2) + '%'}
          </Typography>
        </div>
      ),
      // TODO: Avoid casting sorting function.
      sortingFn: sortCommission as SortingFnOption<PolkadotValidator>,
    }),
    validatorColumnHelper.accessor('href', {
      header: () => <span></span>,
      cell: (props) => {
        return <StakingItemExternalLinkButton href={props.getValue()} />;
      },
    }),
  ];
};

const POLKADOT = {
  type: LsProtocolType.TANGLE_RESTAKING_PARACHAIN,
  id: LsProtocolId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  chainIconFileName: 'polkadot',
  currency: 'Dot',
  decimals: DECIMALS,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 28,
  ss58Prefix: 0,
  adapter: {
    fetchNetworkEntities: fetchValidators,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<PolkadotValidator>;

export default POLKADOT;
