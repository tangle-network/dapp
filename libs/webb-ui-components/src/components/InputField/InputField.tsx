import cx from 'classnames';
import { createContext, forwardRef, useContext } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography';
import {
  InputFieldContextValue,
  InputFieldInputProps,
  InputFieldRootProps,
  InputFieldSlotProps,
} from './types';
import { Avatar } from '../Avatar';
import { shortenHex, shortenString } from '../../utils';

const InputFieldContext = createContext<InputFieldContextValue | undefined>(
  undefined
);

const InputFieldRoot = forwardRef<React.ElementRef<'div'>, InputFieldRootProps>(
  (props, forwardedRef) => {
    const { children, className, isDisabled, error, ...restProps } = props;

    return (
      <div>
        <div
          {...restProps}
          ref={forwardedRef}
          className={twMerge(
            'group flex items-center justify-between gap-1 px-4 py-2 w-full h-[74px] rounded-lg',
            'bg-mono-20 dark:bg-mono-160',
            'outline outline-1 outline-offset-1 outline-transparent',
            cx({
              'outline-red-40 dark:outline-red-90': error,
            }),
            className
          )}
        >
          <InputFieldContext.Provider value={{ isDisabled, error }}>
            {children}
          </InputFieldContext.Provider>
        </div>

        {error && (
          <Typography
            component="p"
            variant="body1"
            className="mt-2 text-red-70 dark:text-red-50"
          >
            {error}
          </Typography>
        )}
      </div>
    );
  }
);
InputFieldRoot.displayName = 'InputFieldRoot';

const InputFieldSlot = forwardRef<React.ElementRef<'div'>, InputFieldSlotProps>(
  (props, forwardedRef) => {
    const { className, ...slotProps } = props;

    const context = useContext(InputFieldContext);

    return (
      <div
        {...slotProps}
        ref={forwardedRef}
        className={twMerge(
          'shrink-0 flex items-center gap-1 h-full',
          cx({
            '!text-mono-100': !context?.isDisabled,
            'text-mono-80 dark:text-mono-120': context?.isDisabled,
          }),
          className
        )}
      />
    );
  }
);
InputFieldSlot.displayName = 'InputFieldSlot';

const InputFieldInput = forwardRef<
  React.ElementRef<'input'>,
  InputFieldInputProps
>((props, forwardedRef) => {
  const context = useContext(InputFieldContext);
  const hasRoot = context !== undefined;

  const {
    className,
    isDisabled,
    error,
    isDisabledHoverStyle,
    isAddressType = 'false',
    title,
    type,
    value,
    addressTheme = 'ethereum',
    ...inputProps
  } = props;

  const input = (
    <div className="flex flex-col gap-1 w-full">
      <Typography
        variant="body1"
        fw="bold"
        className="text-mono-100 dark:text-mono-100 leading-4 tracking-[1%]"
      >
        {title}
      </Typography>

      <div className="flex gap-1 items-center">
        {isAddressType && (
          <Avatar
            value={String(value)}
            sourceVariant="address"
            theme={addressTheme}
          />
        )}

        <input
          spellCheck="false"
          type={type ?? 'text'}
          value={
            isAddressType
              ? addressTheme === 'ethereum'
                ? shortenHex(String(value), 7)
                : shortenString(String(value), 7)
              : value
          }
          {...inputProps}
          disabled={context?.isDisabled ?? isDisabled}
          ref={forwardedRef}
          className={twMerge(
            'h5 font-bold leading-[30px] text-mono-0 dark:text-mono-200 grow bg-transparent focus-visible:outline-none',
            'focus:ring-0 border-0 p-0 w-full',
            cx({
              'text-mono-200 dark:text-mono-0': !isDisabled,
              'text-mono-80 dark:text-mono-120': isDisabled,
              'placeholder:text-mono-100': !isDisabled,
              'placeholder:text-mono-80 dark:placeholder:text-mono-120':
                isDisabled,
            }),
            className
          )}
        />
      </div>
    </div>
  );

  return hasRoot ? (
    input
  ) : (
    <InputFieldRoot
      isDisabled={isDisabled}
      error={error}
      isDisabledHoverStyle={isDisabledHoverStyle}
    >
      {input}
    </InputFieldRoot>
  );
});
InputFieldInput.displayName = 'InputFieldInput';

const InputField = Object.assign(
  {},
  {
    Root: InputFieldRoot,
    Slot: InputFieldSlot,
    Input: InputFieldInput,
  }
);

export default InputField;

export { InputField, InputFieldRoot, InputFieldSlot, InputFieldInput };
