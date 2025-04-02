import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export const Overlay = (props: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={twMerge(
        'absolute inset-0 flex items-center justify-center rounded-lg',
        'bg-mono-40/50 dark:bg-mono-200/50',
        props.className,
      )}
    />
  );
};
