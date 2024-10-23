import { Close } from '@webb-tools/icons';
import {
  IWebbComponentBase,
  PropsOf,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ListCardWrapperProps extends IWebbComponentBase, PropsOf<'div'> {
  title: string;
  overrideTitleProps?: ComponentProps<typeof Typography>;
  onClose?: () => void;
  hideCloseButton?: boolean;
}

export const ListCardWrapper = forwardRef<HTMLDivElement, ListCardWrapperProps>(
  (
    {
      children,
      className,
      hideCloseButton = false,
      onClose,
      overrideTitleProps,
      title,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-col overflow-hidden',
          'rounded-xl bg-mono-0 dark:bg-mono-190 w-full max-w-xl h-full',
          className,
        )}
        ref={ref}
      >
        <div className="flex items-center justify-between mb-4 px-4 md:px-9 pt-4 md:pt-9">
          <Typography variant="h4" fw="bold" {...overrideTitleProps}>
            {title}
          </Typography>

          {!hideCloseButton && (
            <Close onClick={onClose} size="lg" className="cursor-pointer" />
          )}
        </div>

        {children}
      </div>
    );
  },
);

ListCardWrapper.displayName = 'ListCardWrapper';
