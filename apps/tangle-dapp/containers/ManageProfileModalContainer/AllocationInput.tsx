import { BN } from '@polkadot/util';
import { Close, LockLineIcon } from '@webb-tools/icons';
import { Chip, Input, SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useRestakingJobs from '../../data/restaking/useRestakingJobs';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { ServiceType } from '../../types';
import { getChipColorOfServiceType } from '../../utils';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import BaseInput from './BaseInput';
import InputAction from './InputAction';
import useInputAmount from './useInputAmount';

export type AllocationInputProps = {
  amount: BN | null;
  setAmount: (newAmount: BN | null) => void;
  availableServices: ServiceType[];
  availableBalance: BN | null;
  service: ServiceType | null;
  id: string;
  validate?: boolean;
  errorOnEmptyValue?: boolean;
  onDelete?: (service: ServiceType) => void;
  setService?: (service: ServiceType) => void;
};

export const ERROR_MIN_RESTAKING_BOND =
  'Must be at least the minimum restaking bond';

/**
 * A specialized input used to allocate roles for creating or
 * updating job profiles in Substrate.
 */
const AllocationInput: FC<AllocationInputProps> = ({
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
  const { minRestakingBond } = useRestakingLimits();

  const hasActiveJob =
    service !== null ? servicesWithJobs?.includes(service) ?? false : false;

  const min = hasActiveJob ? amount : minRestakingBond;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const minErrorMessage = hasActiveJob
    ? 'Cannot decrease restake for active role'
    : ERROR_MIN_RESTAKING_BOND;

  const { amountString, errorMessage, handleChange } = useInputAmount(
    amount,
    min,
    availableBalance,
    minErrorMessage,
    errorOnEmptyValue,
    setAmount
  );

  const handleDelete = useCallback(() => {
    if (onDelete !== undefined && service !== null) {
      onDelete(service);
    }
  }, [onDelete, service]);

  const handleSetService = useCallback(
    (service: ServiceType) => {
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
                {`≥ ${formatTokenBalance(min, false)}`}
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
        placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
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

export default AllocationInput;
