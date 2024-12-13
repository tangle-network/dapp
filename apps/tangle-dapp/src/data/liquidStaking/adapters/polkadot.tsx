import { BN, BN_ZERO } from '@polkadot/util';
import { createColumnHelper, SortingFnOption } from '@tanstack/react-table';
import {
  LiquidStakingItem,
  LsProtocolId,
} from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import {
  AmountFormatStyle,
  Avatar,
  CheckBox,
  CopyWithTooltip,
  formatDisplayAmount,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import formatFractional from '@webb-tools/webb-ui-components/utils/formatFractional';

import { StakingItemExternalLinkButton } from '../../../components/LiquidStaking/StakingItemExternalLinkButton';
import {
  LsNetworkId,
  LsParachainChainDef,
  LsToken,
} from '../../../constants/liquidStaking/types';
import calculateCommission from '../../../utils/calculateCommission';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';
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

const DECIMALS = 18;

export type PolkadotValidator = {
  address: SubstrateAddress;
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
            {formatDisplayAmount(
              props.getValue(),
              DECIMALS,
              AmountFormatStyle.SI,
            ) + ` ${LsToken.DOT}`}
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
            {formatFractional(calculateCommission(props.getValue()))}
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

const POLKADOT = {
  networkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN,
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
    fetchProtocolEntities: fetchValidators,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<PolkadotValidator>;

export default POLKADOT;
