import { BN } from '@polkadot/util';
import { ChevronDown, Close } from '@webb-tools/icons';
import {
  Chip,
  IconButton,
  Input,
  InputWrapper,
  Label,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { TANGLE_TOKEN_DECIMALS, TANGLE_TOKEN_UNIT } from '../../constants';
import { ServiceType } from '../../types';

export type AllocationInputProps = {
  amount: BN | null;
  availableRoles: ServiceType[];
  service: ServiceType | null;
  title: string;
  id: string;
  isDisabled?: boolean;
  hasDeleteButton?: boolean;
  onDelete?: (role: ServiceType) => void;
  onChange?: (newAmount: BN) => void;
  setRole: (role: ServiceType) => void;
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

const CHAIN_UNIT_CONVERSION_FACTOR = new BN(10).pow(
  new BN(TANGLE_TOKEN_DECIMALS)
);

const AllocationInput: FC<AllocationInputProps> = ({
  amount = null,
  hasDeleteButton = false,
  isDisabled = false,
  availableRoles,
  title,
  id,
  service: role,
  onChange,
  setRole,
  onDelete,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleAmountChange = useCallback(
    (newValue: string) => {
      if (onChange !== undefined && newValue !== '') {
        const newAmountInChainUnits = new BN(newValue).mul(
          CHAIN_UNIT_CONVERSION_FACTOR
        );

        onChange(newAmountInChainUnits);
      }
    },
    [onChange]
  );

  const handleOnDelete = () => {
    if (onDelete !== undefined && role !== null) {
      onDelete(role);
    }
  };

  const amountString =
    amount?.div(CHAIN_UNIT_CONVERSION_FACTOR).toString() ?? '';

  const schema = z
    .string()
    .regex(/^(\d+)?$/, 'Only digits allowed')
    .refine((value) => value === '' || value !== '0'.repeat(value.length), {
      message: 'Value cannot be just zero(s)',
    });

  const validation = schema.safeParse(amountString);

  const errorMessage = !validation.success
    ? // Pick the first error message, since the input component does
      // not support displaying a list of error messages.
      validation.error.issues[0].message
    : undefined;

  return (
    <InputWrapper
      className={twMerge(
        'flex gap-2 dark:bg-mono-160 cursor-default relative !w-full !max-w-[400px]',
        isDisabled && 'opacity-50'
      )}
    >
      <div className="flex flex-col gap-1 mr-auto">
        <Label className="dark:text-mono-80 font-bold" htmlFor={id}>
          {title}
        </Label>

        <Input
          id={id}
          inputClassName="placeholder:text-md"
          value={amountString}
          type="number"
          inputMode="numeric"
          onChange={handleAmountChange}
          placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
          size="sm"
          autoComplete="off"
          isInvalid={!validation.success}
          errorMessage={errorMessage}
          isDisabled={isDisabled}
          min={0}
        />
      </div>

      {/* Dropdown trigger */}
      <div
        onClick={() => {
          if (!isDisabled) {
            setIsDropdownVisible((isVisible) => !isVisible);
          }
        }}
        className={twMerge(
          'flex items-center justify-center gap-1',
          !isDisabled && 'cursor-pointer'
        )}
      >
        <Chip
          color={role === null ? 'grey' : getRoleChipColor(role)}
          className="uppercase dark:bg-mono-140 whitespace-nowrap"
        >
          {role ?? 'Select role'}
        </Chip>

        <ChevronDown size="lg" />
      </div>

      {/* Dropdown body */}
      {isDropdownVisible && (
        <div className="absolute top-[100%] left-0 mt-1 w-full dark:bg-mono-160 shadow-inner rounded-lg overflow-hidden z-50">
          {availableRoles
            .filter((availableRole) => availableRole !== role)
            .map((role) => (
              <div
                key={role}
                onClick={() => setRole(role)}
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

      {/* Delete button */}
      {hasDeleteButton && (
        <IconButton
          disabled={role === null}
          onClick={handleOnDelete}
          className="p-1 rounded-full shadow-xl absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] dark:bg-mono-140 dark:hover:bg-mono-120"
        >
          <Close size="md" />
        </IconButton>
      )}
    </InputWrapper>
  );
};

export default AllocationInput;
