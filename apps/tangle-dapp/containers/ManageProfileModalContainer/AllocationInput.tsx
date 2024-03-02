import { BN } from '@polkadot/util';
import {
  ChevronDown,
  ChevronUp,
  Close,
  LockUnlockLineIcon,
} from '@webb-tools/icons';
import { IconBase, IconSize } from '@webb-tools/icons/types';
import {
  Chip,
  IconWithTooltip,
  Input,
  InputWrapper,
  Label,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC, ReactElement, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import { ServiceType } from '../../types';
import convertChainUnitsToNumber from '../../utils/convertChainUnitsToNumber';
import convertNumberToChainUnits from '../../utils/convertNumberToChainUnits';

export type AllocationInputProps = {
  amount: BN | null;
  availableServices: ServiceType[];
  service: ServiceType | null;
  title: string;
  id: string;
  isDisabled?: boolean;
  hasDeleteButton?: boolean;
  isLocked?: boolean;
  lockTooltip?: string;
  onDelete?: (service: ServiceType) => void;
  onChange?: (newAmountInChainUnits: BN) => void;
  setService: (service: ServiceType) => void;
};

export function getRoleChipColor(
  role: ServiceType
): 'green' | 'blue' | 'purple' {
  switch (role) {
    case ServiceType.ZK_SAAS_GROTH16:
    case ServiceType.ZK_SAAS_MARLIN:
      return 'blue';
    case ServiceType.TX_RELAY:
      return 'green';
    case ServiceType.DKG_TSS_CGGMP:
      return 'purple';
  }
}

const VALIDATION_SCHEMA = z
  .string()
  .regex(
    /^\d*(\.\d+)?$/,
    'Only digits or numbers with a decimal point are allowed'
  )
  .refine(
    (value) => {
      // Check if the value is not just zeros after removing the decimal point
      return (
        value === '' ||
        value.replace('.', '') !== '0'.repeat(value.replace('.', '').length)
      );
    },
    {
      message: 'Value must be greater than zero',
    }
  );

const AllocationInput: FC<AllocationInputProps> = ({
  isLocked = true,
  lockTooltip,
  amount = null,
  hasDeleteButton = false,
  isDisabled = false,
  availableServices,
  title,
  id,
  service,
  onChange,
  setService,
  onDelete,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleAmountChange = useCallback(
    (newValue: string) => {
      // Do nothing if the input is invalid.
      if (onChange === undefined || newValue === '' || newValue.includes('.')) {
        return;
      }

      const newValueAsNumber = Number(newValue);
      const newAmountInChainUnits = convertNumberToChainUnits(newValueAsNumber);

      onChange(newAmountInChainUnits);
    },
    [onChange]
  );

  const handleDelete = () => {
    if (onDelete !== undefined && service !== null) {
      onDelete(service);
    }
  };

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsDropdownVisible((isVisible) => !isVisible);
    }
  };

  const amountAsString =
    amount !== null ? convertChainUnitsToNumber(amount).toString() : '';

  const validationResult = VALIDATION_SCHEMA.safeParse(amountAsString);

  const errorMessage = !validationResult.success
    ? // Pick the first error message, since the input component does
      // not support displaying a list of error messages.
      validationResult.error.issues[0].message
    : undefined;

  return (
    <div className="flex flex-col items-end gap-1">
      <InputWrapper
        className={twMerge(
          'flex gap-2 dark:bg-mono-160 cursor-default relative !w-full !max-w-[400px] border border-mono-160',
          !validationResult.success && 'border-red-50'
        )}
      >
        <div className="flex flex-col gap-1 mr-auto">
          <Label className="dark:text-mono-80 font-bold" htmlFor={id}>
            {title}
          </Label>

          <Input
            id={id}
            inputClassName="placeholder:text-md"
            value={amountAsString}
            type="number"
            inputMode="numeric"
            onChange={handleAmountChange}
            placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
            size="sm"
            autoComplete="off"
            isInvalid={!validationResult.success}
            isDisabled={isDisabled}
            min={0}
          />
        </div>

        {/* Actions */}
        <div
          className={twMerge(
            'flex items-center justify-center gap-1',
            !isDisabled && 'cursor-pointer'
          )}
        >
          <Chip
            onClick={toggleDropdown}
            color={service === null ? 'grey' : getRoleChipColor(service)}
            className={twMerge(
              'uppercase dark:bg-mono-140 whitespace-nowrap',
              !isDisabled && 'cursor-pointer'
            )}
          >
            {service ?? 'Select role'}
          </Chip>

          {isLocked && (
            <Action
              tooltip={lockTooltip}
              Icon={LockUnlockLineIcon}
              iconSize="md"
            />
          )}

          {hasDeleteButton ? (
            <Action Icon={Close} onClick={handleDelete} tooltip="Remove role" />
          ) : (
            <Action
              Icon={isDropdownVisible ? ChevronUp : ChevronDown}
              onClick={toggleDropdown}
            />
          )}
        </div>

        {/* Dropdown body */}
        {isDropdownVisible && (
          <div className="absolute top-[100%] left-0 mt-1 w-full dark:bg-mono-160 shadow-inner rounded-lg overflow-hidden z-50">
            {availableServices
              .filter((availableRole) => availableRole !== service)
              .map((role) => (
                <div
                  key={role}
                  onClick={() => setService(role)}
                  className="flex justify-between p-2 cursor-pointer dark:hover:bg-mono-120"
                >
                  <Chip color={getRoleChipColor(role)}>{role}</Chip>

                  <Chip color="grey" className="dark:bg-mono-140">
                    ≥ 50 {TANGLE_TOKEN_UNIT}
                  </Chip>
                </div>
              ))}
          </div>
        )}
      </InputWrapper>

      {errorMessage !== undefined && (
        <Typography className="dark:text-mono-100" variant="body1" fw="normal">
          *{errorMessage}
        </Typography>
      )}
    </div>
  );
};

type ActionProps = {
  Icon: (props: IconBase) => ReactElement;
  tooltip?: string;
  iconSize?: IconSize;
  onClick?: () => void;
};

const Action: FC<ActionProps> = ({
  tooltip,
  iconSize = 'lg',
  Icon,
  onClick,
}) => {
  return (
    <IconWithTooltip
      icon={
        <Icon
          onClick={onClick}
          size={iconSize}
          className={twMerge(
            'dark:fill-mono-0',
            onClick !== undefined && 'cursor-pointer'
          )}
        />
      }
      overrideTooltipProps={{
        className: 'z-50',
      }}
      overrideTooltipBodyProps={{
        className: 'z-50',
      }}
      content={<>{tooltip}</>}
    />
  );
};

export default AllocationInput;
