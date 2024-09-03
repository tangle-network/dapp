'use client';

import { Search } from '@webb-tools/icons/Search';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { type ComponentProps, type FC, useMemo, useState } from 'react';
import { formatUnits } from 'viem';

import OperatorsTableUI from '../../components/tables/Operators';
import { useRestakeContext } from '../../context/RestakeContext';
import useIdentities from '../../data/useIdentities';
import type { OperatorMap } from '../../types/restake';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorConcentration?: Record<string, number>;
  operatorMap: OperatorMap;
  operatorTVL?: Record<string, number>;
};

const OperatorsTable: FC<Props> = ({
  operatorConcentration,
  operatorMap,
  operatorTVL,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const { assetMap } = useRestakeContext();

  const { result: identities } = useIdentities(
    useMemo(() => Object.keys(operatorMap), [operatorMap]),
  );

  const operators = useMemo(
    () =>
      Object.entries(operatorMap).map<OperatorUI>(
        ([address, { delegations }]) => {
          const vaultAssets = delegations
            .map((delegation) => ({
              asset: assetMap[delegation.assetId],
              amount: delegation.amount,
            }))
            .filter((vaultAsset) => Boolean(vaultAsset.asset));

          const restakerSet = delegations.reduce((restakerSet, delegation) => {
            restakerSet.add(delegation.delegatorAccountId);
            return restakerSet;
          }, new Set<string>());

          const tvlInUsd = operatorTVL?.[address] ?? Number.NaN;
          const concentrationPercentage =
            operatorConcentration?.[address] ?? Number.NaN;

          return {
            address,
            concentrationPercentage,
            identityName: identities[address]?.name ?? '',
            restakersCount: restakerSet.size,
            tvlInUsd,
            vaultTokens: vaultAssets.map(({ asset, amount }) => ({
              amount: +formatUnits(amount, asset.decimals),
              name: asset.name,
              symbol: asset.symbol,
            })),
          };
        },
      ),
    [assetMap, identities, operatorConcentration, operatorMap, operatorTVL],
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
