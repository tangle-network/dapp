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

import { TANGLE_TOKEN_UNIT } from '../../constants';
import { ServiceType } from '../../types';

export type AmountAndRoleComboInputProps = {
  availableRoles: ServiceType[];
  role: ServiceType | null;
  title: string;
  id: string;
  initialAmount?: BN;
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

const AmountAndRoleComboInput: FC<AmountAndRoleComboInputProps> = ({
  initialAmount,
  hasDeleteButton = false,
  isDisabled = false,
  availableRoles,
  title,
  id,
  role,
  onChange,
  setRole,
  onDelete,
}) => {
  const [amount, setAmount] = useState(initialAmount?.toString() ?? '');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleAmountChange = useCallback(
    (newValue: string) => {
      setAmount(newValue);

      if (onChange !== undefined) {
        onChange(new BN(newValue));
      }
    },
    [onChange]
  );

  const handleOnDelete = () => {
    if (onDelete !== undefined && role !== null) {
      onDelete(role);
    }
  };

  const isDisabledCursorClassName = isDisabled ? '' : 'cursor-pointer';
  const isDisabledOpacityClassName = isDisabled ? 'opacity-50' : '';

  return (
    <InputWrapper
      className={twMerge(
        'flex gap-2 dark:bg-mono-160 cursor-default relative !w-full !max-w-[400px]',
        isDisabledOpacityClassName
      )}
    >
      <div className="flex flex-col gap-1 mr-auto">
        <Label className="dark:text-mono-80 font-bold" htmlFor={id}>
          {title}
        </Label>

        <Input
          id={id}
          className="placeholder:text-mono-0 text-mono-200"
          value={amount}
          type="number"
          inputMode="numeric"
          onChange={handleAmountChange}
          placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
          size="sm"
          autoComplete="off"
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
          isDisabledCursorClassName
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

export default AmountAndRoleComboInput;
