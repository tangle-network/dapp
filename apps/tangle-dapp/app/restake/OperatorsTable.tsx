'use client';

import { Search } from '@webb-tools/icons/Search';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { ComponentProps, useMemo, useState } from 'react';

import OperatorsTableUI from '../../components/tables/Operators';
import { useRestakeContext } from '../../context/RestakeContext';
import useRestakeOperatorMap from '../../data/restake/useRestakeOperatorMap';
import useIdentities from '../../data/useIdentities';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

const OperatorsTable = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  const { operatorMap } = useRestakeOperatorMap();
  const { assetMap } = useRestakeContext();

  const { result: identities } = useIdentities(
    useMemo(() => Object.keys(operatorMap), [operatorMap]),
  );

  const operators = useMemo(
    () =>
      Object.entries(operatorMap).map<OperatorUI>(
        ([address, { delegationCount, delegations }]) => {
          const vaultTokens = delegations
            .map((delegation) => assetMap[delegation.assetId]?.symbol)
            .filter(Boolean);

          return {
            address,
            // TODO: Calculate concentration percentage
            concentrationPercentage: 0,
            identityName: identities[address]?.name ?? '',
            restakersCount: delegationCount,
            // TODO: Calculate tvl in USD
            tvlInUsd: 0,
            vaultTokens,
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
        className="w-1/3 mb-4 ml-auto -mt-[54px]"
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
