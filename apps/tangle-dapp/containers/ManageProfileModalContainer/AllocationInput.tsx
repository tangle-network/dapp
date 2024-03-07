import { BN } from '@polkadot/util';
import { Close, LockUnlockLineIcon } from '@webb-tools/icons';
import { Chip, Input, SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { ServiceType } from '../../types';
import { getChipColorOfServiceType } from '../../utils';
import convertChainUnitsToNumber from '../../utils/convertChainUnitsToNumber';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import { DECIMAL_REGEX } from './AmountInput';
import BaseInput from './BaseInput';
import InputAction from './InputAction';

export type AllocationInputProps = {
  amount: BN | null;
  availableServices: ServiceType[];
  availableBalance: BN | null;
  service: ServiceType | null;
  validate: boolean;
  title: string;
  id: string;
  isDisabled?: boolean;
  hasDeleteButton?: boolean;
  isLocked?: boolean;
  lockTooltip?: string;
  onDelete?: (service: ServiceType) => void;
  onChange?: (newValue: string) => void;
  setService: (service: ServiceType) => void;
};

const STATIC_VALIDATION_SCHEMA = z
  .string()
  .regex(
    DECIMAL_REGEX,
    'Only digits or numbers with a decimal point are allowed'
  );

const AllocationInput: FC<AllocationInputProps> = ({
  isLocked = false,
  lockTooltip,
  amount = null,
  availableBalance,
  hasDeleteButton = false,
  isDisabled = false,
  validate,
  availableServices,
  title,
  id,
  service,
  onChange,
  setService,
  onDelete,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { minRestakingBond } = useRestakingLimits();

  const handleDelete = useCallback(() => {
    if (onDelete !== undefined && service !== null) {
      onDelete(service);
    }
  }, [onDelete, service]);

  const handleSetService = (service: ServiceType) => {
    setService(service);
    setIsDropdownVisible(false);
  };

  const amountAsString = useMemo(
    () => (amount !== null ? convertChainUnitsToNumber(amount).toString() : ''),
    [amount]
  );

  const validationResult = useMemo(
    () =>
      STATIC_VALIDATION_SCHEMA.refine(
        () =>
          amount === null ||
          minRestakingBond === null ||
          amount.gte(minRestakingBond),
        {
          message:
            'Amount must be greater than or equal to the minimum restaking bond',
        }
      )
        .refine(
          () =>
            !validate ||
            availableBalance === null ||
            amount === null ||
            amount.lte(availableBalance),
          {
            message: 'Not enough available balance',
          }
        )
        .safeParse(amountAsString),
    [amount, amountAsString, availableBalance, minRestakingBond, validate]
  );

  const errorMessage = !validationResult.success
    ? // Pick the first error message, since the input component does
      // not support displaying a list of error messages.
      validationResult.error.issues[0].message
    : undefined;

  const dropdownBody = availableServices
    .filter((availableRole) => availableRole !== service)
    .map((service) => (
      <div
        key={service}
        onClick={() => handleSetService(service)}
        className="flex justify-between rounded-lg p-2 cursor-pointer hover:bg-mono-20 dark:hover:bg-mono-160"
      >
        <Chip color={getChipColorOfServiceType(service)}>{service}</Chip>

        {minRestakingBond !== null ? (
          <Chip color="dark-grey" className="text-mono-0 dark:text-mono-0">
            {`≥ ${formatTokenBalance(minRestakingBond)}`}
          </Chip>
        ) : (
          <SkeletonLoader />
        )}
      </div>
    ));

  const actions = (
    <>
      {isLocked && (
        <InputAction
          tooltip={lockTooltip}
          Icon={LockUnlockLineIcon}
          iconSize="md"
        />
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
      dropdownBody={!hasDeleteButton ? dropdownBody : undefined}
      errorMessage={errorMessage}
      chipText={service ?? 'Select role'}
      chipColor={
        service !== null ? getChipColorOfServiceType(service) : undefined
      }
    >
      <Input
        id={id}
        inputClassName="placeholder:text-md"
        value={amountAsString}
        type="number"
        inputMode="numeric"
        onChange={onChange}
        isControlled
        placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
        size="sm"
        autoComplete="off"
        isInvalid={!validationResult.success}
        // Disable input if the available balance is not yet loaded.
        isReadOnly={isDisabled || availableBalance === null}
      />
    </BaseInput>
  );
};

export default AllocationInput;
