import { AddLineIcon } from '@tangle-network/icons';
import OperatorsTableUI from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import { OperatorConcentration } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorConcentration';
import { OperatorTvlGroup } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorTvl';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useIsAccountConnected from '@tangle-network/tangle-shared-ui/hooks/useIsAccountConnected';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { RestakeOperator } from '@tangle-network/tangle-shared-ui/types';
import type { OperatorMap } from '@tangle-network/tangle-shared-ui/types/restake';
import delegationsToVaultTokens from '@tangle-network/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import {
  Modal,
  ModalTrigger,
} from '@tangle-network/ui-components/components/Modal';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import cx from 'classnames';
import {
  type ComponentProps,
  type FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { LinkProps } from 'react-router';
import { RestakeOperatorWrapper } from '../../components/tables/RestakeActionWrappers';
import JoinOperatorsModal from './JoinOperatorsModal';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorConcentration?: OperatorConcentration;
  operatorMap: OperatorMap;
  operatorTVL?: OperatorTvlGroup['operatorTvl'];
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
  const activeSubstrateAddress = useSubstrateAddress(false);
  const { assets } = useRestakeAssets();

  const { result: identities } = useIdentities(
    useMemo(
      () =>
        Object.keys(operatorMap).map((address) =>
          assertSubstrateAddress(address),
        ),
      [operatorMap],
    ),
  );

  const operators = useMemo(
    () =>
      Object.entries(operatorMap).map<OperatorUI>(
        ([addressString, { delegations, restakersCount, stake }]) => {
          const address = assertSubstrateAddress(addressString);
          const tvlInUsd = operatorTVL?.get(address) ?? null;

          const concentrationPercentage =
            operatorConcentration?.get(address) ?? null;

          const isDelegated =
            activeSubstrateAddress !== null &&
            delegations.some(
              (delegation) =>
                delegation.delegatorAccountId === activeSubstrateAddress,
            );

          return {
            address,
            concentrationPercentage,
            identityName: identities.get(address)?.name ?? undefined,
            restakersCount,
            tvlInUsd,
            vaultTokens:
              assets === null
                ? []
                : delegationsToVaultTokens(delegations, assets),
            selfBondedAmount: stake,
            isDelegated,
          } satisfies RestakeOperator;
        },
      ),
    [
      operatorMap,
      operatorTVL,
      operatorConcentration,
      activeSubstrateAddress,
      identities,
      assets,
    ],
  );

  const disabledTooltip = isAccountConnected
    ? 'Only Substrate accounts can register as operators at this time.'
    : 'Connect a Substrate account to join as an operator.';

  const isActiveAccountInOperatorMap = useMemo(
    () =>
      activeSubstrateAddress !== null &&
      operatorMap[activeSubstrateAddress] !== undefined,
    [activeSubstrateAddress, operatorMap],
  );

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
            className={cx('mb-4 ml-auto -mt-14', {
              hidden: isActiveAccountInOperatorMap,
            })}
            variant="utility"
            size="sm"
            leftIcon={
              <AddLineIcon
                size="md"
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

        <JoinOperatorsModal setIsOpen={setIsJoinOperatorsModalOpen} />
      </div>
    </Modal>
  );
};

export default OperatorsTable;
