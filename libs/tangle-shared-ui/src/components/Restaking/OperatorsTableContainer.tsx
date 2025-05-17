import OperatorsTableUI from '../tables/Operators';
import type { OperatorConcentration } from '../../data/restake/useOperatorConcentration';
import type { OperatorTvlGroup } from '../../data/restake/useOperatorTvl';
import useRestakeAssets from '../../data/restake/useRestakeAssets';
import useIdentities from '../../hooks/useIdentities';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import type { RestakeOperator } from '../../types';
import type { OperatorMap, OperatorDelegatorBond } from '../../types/restake';
import delegationsToVaultTokens from '../../utils/restake/delegationsToVaultTokens';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import {
  type ComponentProps,
  type FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';
import type { LinkProps } from 'react-router';
import { Button, Modal, ModalTrigger } from '@tangle-network/ui-components';
import { AddLineIcon } from '@tangle-network/icons';
import cx from 'classnames';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import { RestakeOperatorWrapper } from '../tables/RestakeActionWrappers';
import JoinOperatorsModal from './JoinOperatorsModal';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorConcentration?: OperatorConcentration;
  operatorMap: OperatorMap;
  operatorTvl?: OperatorTvlGroup['operatorTvl'];
  onRestakeClicked: LinkProps['onClick'];
  onRestakeClickedPagePath: string;
  onRestakeClickedQueryParamKey: string;
  isLoading?: boolean;
};

const OperatorsTableContainer: FC<Props> = ({
  operatorConcentration,
  operatorMap,
  operatorTvl,
  onRestakeClicked,
  onRestakeClickedPagePath,
  onRestakeClickedQueryParamKey,
  isLoading: isLoadingOperatorMap,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isJoinOperatorsModalOpen, setIsJoinOperatorsModalOpen] =
    useState(false);

  const activeSubstrateAddress = useSubstrateAddress(false);
  const { assets } = useRestakeAssets();
  const isAccountConnected = useIsAccountConnected();
  const { isEvm } = useAgnosticAccountInfo();

  const operatorAddresses = useMemo(
    () => Array.from(operatorMap.keys()).map(assertSubstrateAddress),
    [operatorMap],
  );

  const { result: identities } = useIdentities(operatorAddresses);

  const operators = useMemo(
    () =>
      Array.from(operatorMap.entries()).map<OperatorUI>(
        ([addressString, { delegations, restakersCount, stake }]) => {
          const address = assertSubstrateAddress(addressString);
          const tvlInUsd = operatorTvl?.get(address) ?? null;

          const concentrationPercentage =
            operatorConcentration?.get(address) ?? null;

          const isDelegated =
            activeSubstrateAddress !== null &&
            delegations.some(
              (delegation: OperatorDelegatorBond) =>
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
      operatorTvl,
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
      operatorMap.get(activeSubstrateAddress) !== undefined,
    [activeSubstrateAddress, operatorMap],
  );

  const RestakeAction = useCallback(
    ({ address, children }: PropsWithChildren<{ address: string }>) => {
      return (
        <RestakeOperatorWrapper
          pagePath={onRestakeClickedPagePath}
          queryParamKey={onRestakeClickedQueryParamKey}
          address={address}
          onClick={onRestakeClicked}
        >
          {children}
        </RestakeOperatorWrapper>
      );
    },
    [onRestakeClicked, onRestakeClickedPagePath, onRestakeClickedQueryParamKey],
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
          isLoading={isLoadingOperatorMap}
        />

        <JoinOperatorsModal setIsOpen={setIsJoinOperatorsModalOpen} />
      </div>
    </Modal>
  );
};

export default OperatorsTableContainer;
