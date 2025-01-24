import { AddLineIcon } from '@webb-tools/icons';
import OperatorsTableUI from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { RestakeOperator } from '@webb-tools/tangle-shared-ui/types';
import type { OperatorMap } from '@webb-tools/tangle-shared-ui/types/restake';
import delegationsToVaultTokens from '@webb-tools/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import { Button } from '@webb-tools/webb-ui-components';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { type ComponentProps, type FC, useMemo, useState } from 'react';
import { RestakeOperatorWrapper } from '../../components/tables/RestakeActionWrappers';
import useIdentities from '../../data/useIdentities';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import JoinOperatorsModal from './JoinOperatorsModal';

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
  const [isJoinOperatorsModalOpen, setIsJoinOperatorsModalOpen] =
    useState(false);

  const { isEvm } = useAgnosticAccountInfo();
  const isAccountConnected = useIsAccountConnected();

  const { assetMetadataMap } = useRestakeContext();

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
            vaultTokens: delegationsToVaultTokens(
              delegations,
              assetMetadataMap,
            ),
          } satisfies RestakeOperator;
        },
      ),
    [
      assetMetadataMap,
      identities,
      operatorConcentration,
      operatorMap,
      operatorTVL,
    ],
  );

  const disabledTooltip = isAccountConnected
    ? 'Only Substrate accounts can register as operators at this time.'
    : 'Connect a Substrate account to join as an operator.';

  return (
    <>
      <Button
        className="mb-4 ml-auto -mt-14"
        variant="secondary"
        leftIcon={
          <AddLineIcon size="lg" className="fill-current dark:fill-current" />
        }
        onClick={() => setIsJoinOperatorsModalOpen(true)}
        disabledTooltip={disabledTooltip}
        // Disable the button until it is known whether the current account
        // is an EVM account or not.
        isDisabled={isEvm ?? true}
      >
        Join Operators
      </Button>

      <OperatorsTableUI
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        data={operators}
        RestakeOperatorAction={RestakeOperatorWrapper}
      />

      <JoinOperatorsModal
        isOpen={isJoinOperatorsModalOpen}
        setIsOpen={setIsJoinOperatorsModalOpen}
      />
    </>
  );
};

export default OperatorsTable;
