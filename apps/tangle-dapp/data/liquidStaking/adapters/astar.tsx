import { BN, BN_ZERO } from '@polkadot/util';
import { createColumnHelper, SortingFnOption } from '@tanstack/react-table';
import {
  Avatar,
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
import { GetTableColumnsFn } from '../adapter';
import { sortSelected, sortValueStaked } from '../columnSorting';
import { fetchMappedDappsTotalValueStaked } from '../fetchHelpers';
import RadioInput from '../useLsValidatorSelectionTableColumns';

const DECIMALS = 18;

export type AstarDapp = {
  id: string;
  name: string;
  // TODO: Is this a Substrate address? If so, use `SubstrateAddress` type.
  contractAddress: string;
  identity?: string;
  totalValueStaked: BN;
};

const fetchDapps = async (rpcEndpoint: string): Promise<AstarDapp[]> => {
  const [dapps, mappedTotalValueStaked, stakingDappsResponse] =
    await Promise.all([
      fetchDapps(rpcEndpoint),
      fetchMappedDappsTotalValueStaked(rpcEndpoint),
      fetch('https://api.astar.network/api/v1/astar/dapps-staking/dapps'),
    ]);

  if (!stakingDappsResponse.ok) {
    throw new Error('Failed to fetch staking dapps');
  }

  // TODO: This is typed as 'any'.
  const dappInfosArray = await stakingDappsResponse.json();

  const dappInfosMap = new Map(
    // TODO: Avoid using `any`.
    dappInfosArray.map((dappInfo: any) => [dappInfo.address, dappInfo]),
  );

  return dapps.map((dapp) => {
    const totalValueStaked = mappedTotalValueStaked.get(dapp.id);

    // TODO: Avoid casting.
    const dappInfo = dappInfosMap.get(dapp.contractAddress) as
      | {
          name?: string;
          contractType?: string;
        }
      | undefined;

    return {
      id: dapp.id,
      contractAddress: dapp.contractAddress,
      name:
        dappInfo !== undefined
          ? dappInfo.name || dapp.contractAddress
          : dapp.contractAddress,
      dappContractType:
        dappInfo !== undefined ? dappInfo.contractType || '' : '',
      commission: BN_ZERO,
      totalValueStaked: totalValueStaked ?? BN_ZERO,
      itemType: LiquidStakingItem.DAPP,
    };
  });
};

const getTableColumns: GetTableColumnsFn<AstarDapp> = (
  toggleSortSelectionHandlerRef,
) => {
  const dappColumnHelper = createColumnHelper<AstarDapp>();

  return [
    dappColumnHelper.accessor('contractAddress', {
      header: ({ header }) => {
        toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
        return (
          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-120 dark:text-mono-120"
          >
            dApp
          </Typography>
        );
      },
      cell: (props) => {
        const address = props.getValue();
        const isEthAddress = address.startsWith('0x');
        const dappName = props.row.original.name;

        return (
          <div className="flex items-center gap-2">
            <RadioInput
              checked={props.row.getIsSelected()}
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
                {dappName === address ? shortenString(address, 8) : dappName}
              </Typography>

              <CopyWithTooltip textToCopy={address} isButton={false} />
            </div>
          </div>
        );
      },
      sortingFn: sortSelected as SortingFnOption<AstarDapp>,
    }),
    dappColumnHelper.accessor('totalValueStaked', {
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
            {formatBn(props.getValue(), DECIMALS) + ` ${LsToken.ASTAR}`}
          </Typography>
        </div>
      ),
      sortingFn: sortValueStaked,
    }),
    dappColumnHelper.display({
      id: 'href',
      header: () => <span></span>,
      cell: (props) => {
        const href = `https://portal.astar.network/astar/dapp-staking/dapp?dapp=${props.row.original.contractAddress}`;

        return <StakingItemExternalLinkButton href={href} />;
      },
    }),
  ];
};

const ASTAR: LsParachainChainDef<AstarDapp> = {
  networkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN,
  id: LsProtocolId.ASTAR,
  name: 'Astar',
  token: LsToken.ASTAR,
  chainIconFileName: 'astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: DECIMALS,
  rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
  timeUnit: CrossChainTimeUnit.ASTAR_ERA,
  unstakingPeriod: 7,
  ss58Prefix: 5,
  adapter: {
    fetchProtocolEntities: fetchDapps,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<AstarDapp>;

export default ASTAR;
