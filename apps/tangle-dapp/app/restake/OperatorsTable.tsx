'use client';

import { Search } from '@webb-tools/icons/Search';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { type ComponentProps, type FC, useMemo, useState } from 'react';

import OperatorsTableUI from '../../components/tables/Operators';
import { useRestakeContext } from '../../context/RestakeContext';
import useIdentities from '../../data/useIdentities';
import type { OperatorMap } from '../../types/restake';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorMap: OperatorMap,
}

const OperatorsTable: FC<Props> = ({ operatorMap }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const { assetMap } = useRestakeContext();

  const { result: identities } = useIdentities(
    useMemo(() => Object.keys(operatorMap), [operatorMap]),
  );

  const operators = useMemo(
    () =>
      Object.entries(operatorMap).map<OperatorUI>(
        ([address, { delegationCount, delegations }]) => {
          const vaultAssets = delegations
            .map((delegation) => assetMap[delegation.assetId])
            .filter(Boolean);

          return {
            address,
            // TODO: Calculate concentration percentage
            concentrationPercentage: 0,
            identityName: identities[address]?.name ?? '',
            restakersCount: delegationCount,
            // TODO: Calculate tvl in USD
            tvlInUsd: 0,
            vaultTokens: vaultAssets.map((asset) => ({
              // TODO: Calculate amount
              amount: 0,
              name: asset.name,
              symbol: asset.symbol,
            })),
          };
        },
      ),
    [assetMap, identities, operatorMap],
  );

  return (
    <>
      <Input
        id="search-validators"
        rightIcon={<Search className="mr-2" />}
        placeholder="Search identity or address"
        className="w-1/3 mb-1.5 ml-auto -mt-[54px]"
        isControlled
        debounceTime={500}
        value={globalFilter}
        onChange={setGlobalFilter}
      />
      <OperatorsTableUI
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        data={operators}
      />
    </>
  );
};

export default OperatorsTable;
