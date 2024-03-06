import { ChevronDown, ChevronUp } from '@webb-tools/icons';
import {
  Chip,
  ChipColors,
  InputWrapper,
  Label,
  Typography,
} from '@webb-tools/webb-ui-components';
import { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';

import InputAction from './InputAction';

export type BaseInputProps = {
  title: string;
  id: string;
  children: ReactNode;
  actions?: ReactNode;
  errorMessage?: string;
  dropdownBody?: ReactNode;
  chipText?: string;
  chipColor?: ChipColors;
  isDropdownDisabled?: boolean;
  isDropdownVisible?: boolean;
  setIsDropdownVisible?: Dispatch<SetStateAction<boolean>>;
  wrapperClassName?: string;
  bodyClassName?: string;
  dropdownBodyClassName?: string;
};

const BaseInput: FC<BaseInputProps> = ({
  id,
  title,
  children,
  actions = [],
  errorMessage,
  dropdownBody,
  isDropdownVisible,
  setIsDropdownVisible,
  chipColor,
  chipText,
  isDropdownDisabled = false,
  wrapperClassName,
  bodyClassName,
  dropdownBodyClassName,
}) => {
  const toggleDropdown = () => {
    if (dropdownBody !== undefined && setIsDropdownVisible !== undefined) {
      setIsDropdownVisible((isVisible) => !isVisible);
    }
  };

  return (
    <>
      <InputWrapper
        className={twMerge(
          'flex gap-2 cursor-default relative w-[356px] max-w-[356px] lg:max-w-[356px]',
          'bg-mono-20 dark:bg-mono-160',
          'border border-mono-20 dark:border-mono-160',
          errorMessage !== undefined && 'border-red-50 dark:border-red-50',
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
        <div className={twMerge('flex items-center justify-center gap-1')}>
          {chipText !== undefined && (
            <Chip
              onClick={toggleDropdown}
              color={chipColor ?? 'dark-grey'}
              className={twMerge(
                'uppercase whitespace-nowrap',
                !isDropdownDisabled &&
                  dropdownBody !== undefined &&
                  'cursor-pointer'
              )}
            >
              {chipText}
            </Chip>
          )}

          {actions}

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
