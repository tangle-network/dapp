import { AddLineIcon } from '@webb-tools/icons';
import OperatorsTableUI from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { RestakeOperator } from '@webb-tools/tangle-shared-ui/types';
import type { OperatorMap } from '@webb-tools/tangle-shared-ui/types/restake';
import delegationsToVaultTokens from '@webb-tools/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import {
  type ComponentProps,
  type FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { LinkProps } from 'react-router';
import { RestakeOperatorWrapper } from '../../components/tables/RestakeActionWrappers';
import useIdentities from '../../data/useIdentities';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import JoinOperatorsModal from './JoinOperatorsModal';
import {
  Modal,
  ModalTrigger,
} from '@webb-tools/webb-ui-components/components/Modal';
import { PropsWithChildren } from 'react';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorConcentration?: Record<string, number | null>;
  operatorMap: OperatorMap;
  operatorTVL?: Record<string, number>;
  onRestakeClicked?: LinkProps['onClick'];
};

const OperatorsTable: FC<Props> = ({
  operatorConcentration,
  operatorMap,
  operatorTVL,
  onRestakeClicked,
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

  const RestakeAction = useCallback(
    ({ address, children }: PropsWithChildren<{ address: string }>) => {
      return (
        <RestakeOperatorWrapper address={address} onClick={onRestakeClicked}>
          {children}
        </RestakeOperatorWrapper>
      );
    },
    [onRestakeClicked],
  );

  return (
    <Modal
      open={isJoinOperatorsModalOpen}
      onOpenChange={setIsJoinOperatorsModalOpen}
    >
      <div className="w-full [&>button]:block [&>button]:ml-auto">
        <ModalTrigger asChild>
          <Button
            className="mb-4 ml-auto -mt-14"
            variant="secondary"
            leftIcon={
              <AddLineIcon
                size="lg"
                className="fill-current dark:fill-current"
              />
            }
            onClick={() => setIsJoinOperatorsModalOpen(true)}
            disabledTooltip={disabledTooltip}
            // Disable the button until it is known whether the current account
            // is an EVM account or not.
            isDisabled={isEvm ?? true}
            as="span"
          >
            Join Operators
          </Button>
        </ModalTrigger>

        <OperatorsTableUI
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          data={operators}
          RestakeOperatorAction={RestakeAction}
        />

        <JoinOperatorsModal />
      </div>
    </Modal>
  );
};

export default OperatorsTable;
