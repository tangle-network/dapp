import { BN } from '@polkadot/util';
import { Close, LockLineIcon } from '@webb-tools/icons';
import { Chip, Input, SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';

import BaseInput from '../../../components/AmountInput/BaseInput';
import useInputAmount from '../../../components/AmountInput/useInputAmount';
import useNetworkStore from '../../../context/useNetworkStore';
import useRestakingAllocations from '../../../data/restaking/useRestakingAllocations';
import useRestakingJobs from '../../../data/restaking/useRestakingJobs';
import useRestakingLimits from '../../../data/restaking/useRestakingLimits';
import useRestakingProfile from '../../../data/restaking/useRestakingProfile';
import { RestakingProfileType, RestakingService } from '../../../types';
import { getChipColorOfServiceType } from '../../../utils';
import { formatTokenBalance } from '../../../utils/polkadot/tokens';
import InputAction from '../InputAction';

export type IndependentAllocationInputProps = {
  amount: BN | null;
  setAmount: (newAmount: BN | null) => void;
  availableServices: RestakingService[];
  availableBalance: BN | null;
  service: RestakingService | null;
  id: string;
  validate?: boolean;
  errorOnEmptyValue?: boolean;
  onDelete?: (service: RestakingService) => void;
  setService?: (service: RestakingService) => void;
};

export const ERROR_MIN_RESTAKING_BOND =
  'Must be at least the minimum restaking bond';

export const ERROR_NOT_ENOUGH_BALANCE = 'Not enough available balance';

/**
 * A specialized input used to allocate roles for creating or
 * updating job profiles in Substrate.
 */
const IndependentAllocationInput: FC<IndependentAllocationInputProps> = ({
  amount = null,
  setAmount,
  availableBalance,
  availableServices,
  validate = true,
  id,
  service,
  setService,
  onDelete,
  errorOnEmptyValue = true,
}) => {
  const { servicesWithJobs } = useRestakingJobs();
  const { profileTypeOpt } = useRestakingProfile();
  const { minRestakingBond } = useRestakingLimits();
  const { nativeTokenSymbol } = useNetworkStore();

  // TODO: This is misleading, because it defaults to `false` when `servicesWithJobs` is still loading. It needs to default to `null` and have its loading state handled appropriately.
  const hasActiveJob = (() => {
    if (
      service === null ||
      profileTypeOpt === null ||
      servicesWithJobs === null
    ) {
      return false;
    }

    return (
      servicesWithJobs.includes(service) &&
      profileTypeOpt.value === RestakingProfileType.INDEPENDENT
    );
  })();

  const { value: substrateAllocationsOpt } = useRestakingAllocations();

  const substrateAllocationAmount = useMemo(() => {
    if (
      service === null ||
      substrateAllocationsOpt === null ||
      substrateAllocationsOpt.value === null
    ) {
      return null;
    }

    return substrateAllocationsOpt.value[service] ?? null;
  }, [service, substrateAllocationsOpt]);

  const min = hasActiveJob
    ? substrateAllocationAmount ?? minRestakingBond
    : minRestakingBond;

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const minErrorMessage = hasActiveJob
    ? 'Cannot decrease restake amount for an active role'
    : ERROR_MIN_RESTAKING_BOND;

  const {
    displayAmount: amountString,
    errorMessage,
    handleChange,
  } = useInputAmount(
    amount,
    min,
    availableBalance,
    errorOnEmptyValue,
    setAmount,
    minErrorMessage,
    ERROR_NOT_ENOUGH_BALANCE
  );

  const handleDelete = useCallback(() => {
    if (onDelete !== undefined && service !== null) {
      onDelete(service);
    }
  }, [onDelete, service]);

  const handleSetService = useCallback(
    (service: RestakingService) => {
      if (setService === undefined) {
        return;
      }

      setService(service);
      setIsDropdownVisible(false);
    },
    [setService]
  );

  const dropdownBody = useMemo(
    () =>
      availableServices
        .filter((availableRole) => availableRole !== service)
        // Sort roles in ascending order, by their display
        // values (strings). This is done with the intent to
        // give priority to the TSS roles.
        .toSorted((a, b) => a.localeCompare(b))
        .map((service) => (
          <div
            key={service}
            onClick={() => handleSetService(service)}
            className="flex justify-between rounded-lg p-2 cursor-pointer hover:bg-mono-20 dark:hover:bg-mono-160"
          >
            <Chip color={getChipColorOfServiceType(service)}>{service}</Chip>

            {min !== null ? (
              <Chip color="dark-grey" className="text-mono-0 dark:text-mono-0">
                {`≥ ${formatTokenBalance(min)}`}
              </Chip>
            ) : (
              <SkeletonLoader />
            )}
          </div>
        )),
    [availableServices, handleSetService, min, service]
  );

  // Users can remove roles only if there are no active services
  // linked to those roles.
  const canBeDeleted = !hasActiveJob && onDelete !== undefined;

  const actions = (
    <>
      {hasActiveJob && (
        <InputAction
          tooltip={
            'Active service(s) in progress; can only have restake amount increased.'
          }
          Icon={LockLineIcon}
          iconSize="md"
        />
      )}

      {canBeDeleted && (
        <InputAction
          Icon={Close}
          onClick={handleDelete}
          tooltip="Remove role"
        />
      )}
    </>
  );

  const hasDropdownBody = !hasActiveJob && setService !== undefined;

  return (
    <BaseInput
      id={id}
      isDropdownVisible={isDropdownVisible}
      setIsDropdownVisible={setIsDropdownVisible}
      title="Total Restake"
      actions={actions}
      dropdownBody={hasDropdownBody ? dropdownBody : undefined}
      errorMessage={validate ? errorMessage ?? undefined : undefined}
      chipText={service ?? 'Select role'}
      chipColor={
        service !== null ? getChipColorOfServiceType(service) : undefined
      }
    >
      <Input
        id={id}
        inputClassName="placeholder:text-md"
        value={amountString}
        onChange={handleChange}
        type="text"
        placeholder={`0 ${nativeTokenSymbol}`}
        size="sm"
        autoComplete="off"
        isInvalid={errorMessage !== undefined}
        // Disable input if the available balance is not yet loaded.
        isReadOnly={availableBalance === null}
        isControlled
      />
    </BaseInput>
  );
};

export default IndependentAllocationInput;
