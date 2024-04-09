import { ChevronDown, ChevronUp } from '@webb-tools/icons';
import {
  Chip,
  ChipColors,
  Label,
  Typography,
} from '@webb-tools/webb-ui-components';
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
} from 'react';
import { twMerge } from 'tailwind-merge';

import InputAction from '../../containers/ManageProfileModalContainer/InputAction';
import { useErrorCountContext } from '../../context/ErrorsContext';

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
  isFullWidth?: boolean;
  isDisabled?: boolean;
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
  isFullWidth = false,
  isDisabled = false,
}) => {
  const { addError, removeError } = useErrorCountContext();

  const toggleDropdown = useCallback(() => {
    if (dropdownBody !== undefined && setIsDropdownVisible !== undefined) {
      setIsDropdownVisible((isVisible) => !isVisible);
    }
  }, [dropdownBody, setIsDropdownVisible]);

  // TODO: Do not set error (or remove it if already set) if the input is disabled.
  useEffect(() => {
    if (errorMessage !== undefined) {
      addError(id);
    } else {
      removeError(id);
    }
  }, [addError, errorMessage, id, removeError]);

  // Do not consider the input as having an error if it's disabled.
  const hasError = errorMessage !== undefined && !isDisabled;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-1 w-full max-w-[356px]',
        isFullWidth && 'max-w-full'
      )}
    >
      <div
        className={twMerge(
          'relative rounded-lg',
          'px-2.5 lg:px-4 py-2',
          'flex items-center justify-between gap-2',
          'w-[356px] max-w-[356px]',
          'bg-mono-20 dark:bg-mono-160',
          'border border-mono-20 dark:border-mono-160',
          hasError && 'border-red-70 dark:border-red-50',
          isFullWidth && 'w-full max-w-full',
          wrapperClassName
        )}
      >
        <div className="flex flex-col gap-1 w-full mr-auto">
          <Label
            className="text-mono-100 dark:text-mono-80 font-bold"
            htmlFor={id}
          >
            {title}
          </Label>

          <div className={bodyClassName}>{children}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-1">
          {chipText !== undefined && (
            <Chip
              onClick={toggleDropdown}
              color={chipColor ?? 'dark-grey'}
              className={twMerge(
                'inline-block uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]',
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
      </div>

      {hasError && (
        <Typography
          className="text-red-70 dark:text-red-50"
          variant="body1"
          fw="normal"
        >
          *{errorMessage}
        </Typography>
      )}
    </div>
  );
};

export default BaseInput;
