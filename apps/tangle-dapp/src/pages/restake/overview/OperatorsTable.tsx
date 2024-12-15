import { Search } from '@webb-tools/icons/Search';
import type { OperatorMap } from '@webb-tools/tangle-shared-ui/types/restake';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { type ComponentProps, type FC, useMemo, useState } from 'react';

import OperatorsTableUI from '../../../components/tables/Operators';
import { useRestakeContext } from '../../../context/RestakeContext';
import useIdentities from '../../../data/useIdentities';
import { delegationsToVaultTokens } from '../utils';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorConcentration?: Record<string, number | null>;
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
        ([addressString, { delegations, restakersCount }]) => {
          const address = assertSubstrateAddress(addressString);
          const tvlInUsd = operatorTVL?.[address] ?? null;
          const concentrationPercentage =
            operatorConcentration?.[address] ?? null;

          return {
            address,
            concentrationPercentage,
            identityName: identities[address]?.name ?? '',
            restakersCount,
            tvlInUsd,
            vaultTokens: delegationsToVaultTokens(delegations, assetMap),
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
        placeholder="Search by identity or address..."
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
