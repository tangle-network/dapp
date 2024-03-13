import { BN } from '@polkadot/util';
import { Close, LockLineIcon } from '@webb-tools/icons';
import { Chip, Input, SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import { ServiceType } from '../../types';
import { getChipColorOfServiceType } from '../../utils';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import BaseInput from './BaseInput';
import InputAction from './InputAction';
import useInputAmount from './useInputAmount';

export type AllocationInputProps = {
  amount: BN | null;
  min: BN | null;
  setAmount: (newAmount: BN | null) => void;
  availableServices: ServiceType[];
  availableBalance: BN | null;
  service: ServiceType | null;
  title: string;
  id: string;
  isDisabled?: boolean;
  hasDeleteButton?: boolean;
  lockTooltip?: string;
  validate: boolean;
  minErrorMessage: string;
  onDelete?: (service: ServiceType) => void;
  setService: (service: ServiceType) => void;
};

const AllocationInput: FC<AllocationInputProps> = ({
  lockTooltip,
  amount = null,
  min,
  setAmount,
  availableBalance,
  hasDeleteButton = false,
  isDisabled = false,
  availableServices,
  validate,
  title,
  id,
  minErrorMessage,
  service,
  setService,
  onDelete,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const { amountString, errorMessage, handleChange } = useInputAmount(
    amount,
    min,
    availableBalance,
    minErrorMessage,
    setAmount
  );

  const handleDelete = useCallback(() => {
    if (onDelete !== undefined && service !== null) {
      onDelete(service);
    }
  }, [onDelete, service]);

  const handleSetService = useCallback(
    (service: ServiceType) => {
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

  const isLocked = lockTooltip !== undefined;

  const actions = (
    <>
      {isLocked && (
        <InputAction tooltip={lockTooltip} Icon={LockLineIcon} iconSize="md" />
      )}

      {hasDeleteButton && (
        <InputAction
          Icon={Close}
          onClick={handleDelete}
          tooltip="Remove role"
        />
      )}
    </>
  );

  return (
    <BaseInput
      isDropdownVisible={isDropdownVisible}
      setIsDropdownVisible={setIsDropdownVisible}
      title={title}
      id={id}
      actions={actions}
      dropdownBody={!hasDeleteButton && !isLocked ? dropdownBody : undefined}
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
        isReadOnly={isDisabled || availableBalance === null}
        isControlled
      />
    </BaseInput>
  );
};

export default AllocationInput;
