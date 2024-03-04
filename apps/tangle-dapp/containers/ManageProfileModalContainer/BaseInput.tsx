import { ChevronDown, ChevronUp } from '@webb-tools/icons';
import {
  Chip,
  ChipColors,
  InputWrapper,
  Label,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputAction from './InputAction';

export type BaseInputProps = {
  title: string;
  id: string;
  children: ReactNode;
  actions?: ReactNode[];
  isValid?: boolean;
  errorMessage?: string;
  dropdownBody?: ReactNode;
  chipText?: string;
  chipColor?: ChipColors;
  isDropdownDisabled?: boolean;
  wrapperClassName?: string;
  bodyClassName?: string;
  dropdownBodyClassName?: string;
};

const BaseInput: FC<BaseInputProps> = ({
  id,
  title,
  isValid = true,
  children,
  actions = [],
  errorMessage,
  dropdownBody,
  chipColor,
  chipText,
  isDropdownDisabled = false,
  wrapperClassName,
  bodyClassName,
  dropdownBodyClassName,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    if (dropdownBody !== undefined) {
      setIsDropdownVisible((isVisible) => !isVisible);
    }
  };

  return (
    <>
      <InputWrapper
        className={twMerge(
          'flex gap-2 cursor-default relative !w-full !max-w-[400px]',
          'bg-mono-20 dark:bg-mono-160',
          'border border-mono-20 dark:border-mono-160',
          !isValid && 'border-red-50 dark:border-red-50',
          wrapperClassName
        )}
      >
        <div className="flex flex-col gap-1 mr-auto">
          <Label
            className="text-mono-100 dark:text-mono-80 font-bold"
            htmlFor={id}
          >
            {title}
          </Label>

          <div className={bodyClassName}>{children}</div>
        </div>

        {/* Actions */}
        <div
          className={twMerge(
            'flex items-center justify-center gap-1',
            !isDropdownDisabled && 'cursor-pointer'
          )}
        >
          {actions}

          {chipText !== undefined && (
            <Chip
              onClick={toggleDropdown}
              color={chipColor}
              className={twMerge(
                'uppercase whitespace-nowrap',
                'text-mono-0 dark:text-mono-0 bg-mono-100 dark:bg-mono-140',
                !isDropdownDisabled &&
                  dropdownBody !== undefined &&
                  'cursor-pointer'
              )}
            >
              {chipText}
            </Chip>
          )}

          {/* If the input has a dropdown body, add a dropdown toggle button. */}
          {dropdownBody !== undefined && (
            <InputAction
              Icon={isDropdownVisible ? ChevronUp : ChevronDown}
              onClick={toggleDropdown}
            />
          )}
        </div>

        {/* Dropdown body */}
        {dropdownBody !== undefined && isDropdownVisible && (
          <div
            className={twMerge(
              'absolute z-50 top-[100%] left-0 mt-1 w-full bg-mono-0 border border-mono-40 dark:border-mono-140 dark:bg-mono-170 shadow-md rounded-lg overflow-hidden max-h-56 overflow-y-auto',
              dropdownBodyClassName
            )}
          >
            {dropdownBody}
          </div>
        )}
      </InputWrapper>

      {errorMessage !== undefined && (
        <Typography className="dark:text-mono-100" variant="body1" fw="normal">
          *{errorMessage}
        </Typography>
      )}
    </>
  );
};

export default BaseInput;
