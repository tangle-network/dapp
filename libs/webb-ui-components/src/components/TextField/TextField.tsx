'use client';

import { createContext, forwardRef, useContext } from 'react';
import {
  TextFieldContextValue,
  TextFieldInputProps,
  TextFieldRootProps,
  TextFieldSlotProps,
} from './types';
import { twMerge } from 'tailwind-merge';
import cx from 'classnames';
import { Typography } from '../../typography';

const TextFieldContext = createContext<TextFieldContextValue | undefined>(
  undefined
);

const TextFieldRoot = forwardRef<React.ElementRef<'div'>, TextFieldRootProps>(
  (props, forwardedRef) => {
    const { children, className, isDisabled, error, ...restProps } = props;

    return (
      <>
        <div
          {...restProps}
          ref={forwardedRef}
          className={twMerge(
            'group flex items-center gap-1 px-4 py-2 max-w-md rounded-lg',
            'bg-[#F7F8F7]/50 dark:bg-mono-180',
            'outline outline-1 outline-offset-1 outline-transparent',
            cx({
              'dark:hover:bg-mono-170': !isDisabled && !error,
              'hover:outline-mono-40 dark:hover:outline-mono-160':
                !isDisabled && !error,
              'outline-red-70 dark:outline-red-90': error,
            }),
            className
          )}
        >
          <TextFieldContext.Provider value={{ isDisabled, error }}>
            {children}
          </TextFieldContext.Provider>
        </div>

        {error && (
          <Typography
            component="p"
            variant="body1"
            className="mt-1 text-red-70 dark:text-red-90"
          >
            {error}
          </Typography>
        )}
      </>
    );
  }
);
TextFieldRoot.displayName = 'TextFieldRoot';

const TextFieldSlot = forwardRef<React.ElementRef<'div'>, TextFieldSlotProps>(
  (props, forwardedRef) => {
    const { className, ...slotProps } = props;

    const context = useContext(TextFieldContext);

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
TextFieldSlot.displayName = 'TextFieldSlot';

const TextFieldInput = forwardRef<
  React.ElementRef<'input'>,
  TextFieldInputProps
>((props, forwardedRef) => {
  const context = useContext(TextFieldContext);
  const hasRoot = context !== undefined;

  const { className, isDisabled, error, ...inputProps } = props;

  const input = (
    <>
      <input
        spellCheck="false"
        {...inputProps}
        disabled={context?.isDisabled ?? isDisabled}
        ref={forwardedRef}
        className={twMerge(
          'h5 font-bold grow bg-transparent focus-visible:outline-none',
          'focus:ring-0 border-0 p-0',
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
    </>
  );

  return hasRoot ? (
    input
  ) : (
    <TextFieldRoot isDisabled={isDisabled} error={error}>
      {input}
    </TextFieldRoot>
  );
});
TextFieldInput.displayName = 'TextFieldInput';

const TextField = Object.assign(
  {},
  {
    Root: TextFieldRoot,
    Slot: TextFieldSlot,
    Input: TextFieldInput,
  }
);

export default TextField;

export { TextField, TextFieldRoot, TextFieldSlot, TextFieldInput };
