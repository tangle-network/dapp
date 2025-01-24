import { Search } from '@webb-tools/icons/Search';
import OperatorsTableUI from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import type { OperatorMap } from '@webb-tools/tangle-shared-ui/types/restake';
import delegationsToVaultTokens from '@webb-tools/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { type ComponentProps, type FC, useMemo, useState } from 'react';
import {
  RestakeOperatorWrapper,
  ViewOperatorWrapper,
} from '../../components/tables/RestakeActionWrappers';
import useIdentities from '../../data/useIdentities';
import { RestakeOperator } from '@webb-tools/tangle-shared-ui/types';

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
  const { vaults } = useRestakeContext();

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
            identityName: identities[address]?.name ?? undefined,
            restakersCount,
            tvlInUsd,
            vaultTokens: delegationsToVaultTokens(delegations, vaults),
          } satisfies RestakeOperator;
        },
      ),
    [vaults, identities, operatorConcentration, operatorMap, operatorTVL],
  );

  return (
    <>
      <Input
        id="operators-table-search-operators"
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
        ViewOperatorAction={ViewOperatorWrapper}
        RestakeOperatorAction={RestakeOperatorWrapper}
      />
    </>
  );
};

export default OperatorsTable;
