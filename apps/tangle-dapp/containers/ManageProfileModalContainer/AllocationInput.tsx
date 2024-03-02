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
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactElement, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { ServiceType } from '../../types';
import convertAmountStringToChainUnits from '../../utils/convertAmountStringToChainUnits';
import convertChainUnitsToNumber from '../../utils/convertChainUnitsToNumber';
import { formatTokenBalance } from '../../utils/polkadot/tokens';

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

const DECIMAL_REGEX = /^\d*(\.\d+)?$/;

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

  const { data: minRestakingBond } = usePolkadotApiRx(
    useCallback((api) => api.query.roles.minRestakingBond(), [])
  );

  const handleAmountChange = useCallback(
    (newValue: string) => {
      // Do nothing if the input is invalid or empty.
      if (
        onChange === undefined ||
        newValue === '' ||
        !DECIMAL_REGEX.test(newValue)
      ) {
        return;
      }

      const newAmountInChainUnits = convertAmountStringToChainUnits(newValue);

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

  // TODO: Also validate that the amount is below the remaining allocation balance. Accept a prop for the remaining balance.
  const validationResult = STATIC_VALIDATION_SCHEMA.refine(
    () =>
      amount === null ||
      minRestakingBond === null ||
      amount.gte(minRestakingBond),
    {
      message:
        'Amount must be greater than or equal to the minimum restaking bond.',
    }
  ).safeParse(amountAsString);

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
            isReadOnly={isDisabled}
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

                  {minRestakingBond !== null ? (
                    <Chip color="grey" className="dark:bg-mono-140">
                      {`≥ ${formatTokenBalance(minRestakingBond)}`}
                    </Chip>
                  ) : (
                    <SkeletonLoader />
                  )}
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
      content={<>{tooltip}</>}
    />
  );
};

export default AllocationInput;
