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
  LsNetworkId,
  LsParachainChainDef,
  LsProtocolId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { LiquidStakingItem } from '../../../types/liquidStaking';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';
import formatBn from '../../../utils/formatBn';
import { getApiPromise } from '../../../utils/polkadot';
import { FetchProtocolEntitiesFn, GetTableColumnsFn } from '../adapter';
import {
  sortDelegationCount,
  sortSelected,
  sortValueStaked,
} from '../columnSorting';
import {
  fetchMappedCollatorInfo,
  fetchMappedIdentityNames,
} from '../fetchHelpers';

const DECIMALS = 18;

export type MantaCollator = {
  // TODO: Is `collatorAddress` a Substrate address? If so, use `SubstrateAddress` type.
  address: string;
  identity: string;
  delegationCount: number;
  totalValueStaked: BN;
};

const fetchAllCollators = async (rpcEndpoint: string) => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.parachainStaking) {
    throw new Error('parachainStaking pallet is not available in the runtime');
  }

  const selectedCollators =
    await api.query.parachainStaking.selectedCandidates();

  return selectedCollators.map((collator) => collator.toString());
};

const fetchCollators: FetchProtocolEntitiesFn<MantaCollator> = async (
  rpcEndpoint,
) => {
  const [collators, mappedIdentityNames, mappedCollatorInfo] =
    await Promise.all([
      fetchAllCollators(rpcEndpoint),
      fetchMappedIdentityNames(rpcEndpoint),
      fetchMappedCollatorInfo(rpcEndpoint),
    ]);

  return collators.map((collator) => {
    const identityName = mappedIdentityNames.get(collator);
    const collatorInfo = mappedCollatorInfo.get(collator);

    return {
      id: collator,
      address: collator,
      identity: identityName || collator,
      delegationCount: collatorInfo?.delegationCount ?? 0,
      totalValueStaked: collatorInfo?.totalStaked ?? BN_ZERO,
      itemType: LiquidStakingItem.COLLATOR,
    };
  });
};

const getTableColumns: GetTableColumnsFn<MantaCollator> = (
  toggleSortSelectionHandlerRef,
) => {
  const collatorColumnHelper = createColumnHelper<MantaCollator>();

  return [
    collatorColumnHelper.accessor('address', {
      header: ({ header }) => {
        toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
        return (
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            Collator
          </Typography>
        );
      },
      cell: (props) => {
        const address = props.getValue();
        const isEthAddress = address.startsWith('0x');
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
                theme={isEthAddress ? 'ethereum' : 'substrate'}
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
      sortingFn: sortSelected as SortingFnOption<MantaCollator>,
    }),
    collatorColumnHelper.accessor('totalValueStaked', {
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
            {formatBn(props.getValue(), DECIMALS) + ` ${LsToken.GLMR}`}
          </Typography>
        </div>
      ),
      sortingFn: sortValueStaked,
    }),
    collatorColumnHelper.accessor('delegationCount', {
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
            Delegations
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
            {props.getValue()}
          </Typography>
        </div>
      ),
      sortingFn: sortDelegationCount as SortingFnOption<MantaCollator>,
    }),
    collatorColumnHelper.display({
      id: 'identity',
      header: () => <span></span>,
      cell: () => {
        // Note that Moonbeam collators don't have a direct link on
        // stakeglmr.com.
        return <StakingItemExternalLinkButton href="https://stakeglmr.com/" />;
      },
    }),
  ];
};

const MANTA: LsParachainChainDef<MantaCollator> = {
  networkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN,
  id: LsProtocolId.MANTA,
  name: 'Manta',
  token: LsToken.MANTA,
  chainIconFileName: 'manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://ws.manta.systems',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
  ss58Prefix: 77,
  adapter: {
    fetchProtocolEntities: fetchCollators,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<MantaCollator>;

export default MANTA;
