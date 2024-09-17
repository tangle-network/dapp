import { BN_ZERO } from '@polkadot/util';
import { createColumnHelper, SortingFnOption } from '@tanstack/react-table';
import {
  Avatar,
  CheckBox,
  CopyWithTooltip,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

import { StakingItemExternalLinkButton } from '../../../components/LiquidStaking/StakingItemExternalLinkButton';
import { IS_PRODUCTION_ENV } from '../../../constants/env';
import {
  LsNetworkId,
  LsProtocolId,
  LsTangleMainnetDef,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { LiquidStakingItem } from '../../../types/liquidStaking';
import assertSubstrateAddress from '../../../utils/assertSubstrateAddress';
import calculateCommission from '../../../utils/calculateCommission';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';
import formatBn from '../../../utils/formatBn';
import { GetTableColumnsFn } from '../adapter';
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
import { PolkadotValidator } from './polkadot';

const DECIMALS = 18;

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
      address: assertSubstrateAddress(address.toString()),
      identity: identityName ?? address.toString(),
      totalValueStaked: totalValueStaked ?? BN_ZERO,
      apy: 0,
      commission: commission ?? BN_ZERO,
      itemType: LiquidStakingItem.VALIDATOR,
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

              <CopyWithTooltip textToCopy={address} isButton={false} />
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
            {formatBn(props.getValue(), DECIMALS) + ` ${LsToken.DOT}`}
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
    validatorColumnHelper.display({
      id: 'href',
      header: () => <span></span>,
      cell: (props) => {
        const href = `https://polkadot.subscan.io/account/${props.getValue()}`;

        return <StakingItemExternalLinkButton href={href} />;
      },
    }),
  ];
};

const TANGLE = {
  networkId: LsNetworkId.TANGLE_MAINNET,
  id: LsProtocolId.TANGLE,
  name: 'Tangle',
  token: LsToken.TNT,
  chainIconFileName: 'tangle',
  decimals: DECIMALS,
  rpcEndpoint: IS_PRODUCTION_ENV
    ? TANGLE_MAINNET_NETWORK.wsRpcEndpoint
    : TANGLE_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 28,
  ss58Prefix: TANGLE_MAINNET_NETWORK.ss58Prefix,
  adapter: {
    fetchProtocolEntities: fetchValidators,
    getTableColumns,
  },
} as const satisfies LsTangleMainnetDef;

export default TANGLE;
