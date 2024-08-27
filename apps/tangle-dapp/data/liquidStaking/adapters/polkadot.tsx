import { BN, BN_ZERO } from '@polkadot/util';
import { AccessorKeyColumnDef } from '@tanstack/react-table';

import {
  LsParachainChainDef,
  LsProtocolId,
  LsProtocolType,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { LiquidStakingItem } from '../../../types/liquidStaking';
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

const getTableColumns = (): AccessorKeyColumnDef<PolkadotValidator>[] => {
  // const columnHelper = createColumnHelper<PolkadotValidator>();

  // return [
  //   columnHelper.accessor('address', {
  //     header: () => <HeaderCell title="Address" className="justify-start" />,
  //     cell: (props) => {
  //       const address = props.getValue();
  //       const identity = props.row.original.identity;

  //       return (
  //         <div className="flex items-center gap-2">
  //           <CheckBox
  //             wrapperClassName="!block !min-h-auto cursor-pointer"
  //             className="cursor-pointer"
  //             isChecked={props.row.getIsSelected()}
  //             onChange={props.row.getToggleSelectedHandler()}
  //           />

  //           <div className="flex items-center space-x-1">
  //             <Avatar
  //               sourceVariant="address"
  //               value={address}
  //               theme="substrate"
  //             />

  //             <Typography variant="body1" fw="normal" className="truncate">
  //               {identity === address ? shortenString(address, 6) : identity}
  //             </Typography>

  //             <CopyWithTooltip
  //               textToCopy={address}
  //               isButton={false}
  //               className="cursor-pointer"
  //               iconClassName="!fill-mono-160 dark:!fill-mono-80"
  //             />
  //           </div>
  //         </div>
  //       );
  //     },
  //     // sortingFn: (rowA, rowB, columnId) =>
  //     //   sortValidatorsBasedOnSortingFn(
  //     //     rowA,
  //     //     rowB,
  //     //     columnId,
  //     //     getSortAddressOrIdentityFnc<Validator>(),
  //     //     isDesc,
  //     //   ),
  //     // TODO: Create a generic filter function?
  //     filterFn: (row, _, filterValue) => {
  //       return (
  //         row.original.address
  //           .toLowerCase()
  //           .includes(filterValue.toLowerCase()) ||
  //         row.original.identity
  //           .toLowerCase()
  //           .includes(filterValue.toLowerCase())
  //       );
  //     },
  //   }),
  // ];

  return [];
};

const POLKADOT = {
  type: LsProtocolType.TANGLE_RESTAKING_PARACHAIN,
  id: LsProtocolId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  chainIconFileName: 'polkadot',
  currency: 'Dot',
  decimals: 10,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 28,
  ss58Prefix: 0,
  adapter: {
    fetchValidators,
    getTableColumns,
  },
} as const satisfies LsParachainChainDef<PolkadotValidator>;

export default POLKADOT;
