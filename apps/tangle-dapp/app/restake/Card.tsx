import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { twMerge } from 'tailwind-merge';

export default function Card({
  children,
  className,
  ...props
}: PropsOf<'div'>) {
  return (
    <div
      {...props}
      className={twMerge(
        'w-full max-w-xl min-h-[var(--restake-card-min-height)]',
        'h-full bg-mono-0 dark:bg-[var(--restake-card-bg-dark)] dark:bg-opacity-90',
        'mx-auto rounded-xl space-y-4 grow',
        'border border-mono-40 dark:border-mono-190 p-5 md:p-9',
        'flex flex-col',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        className,
      )}
    >
      {children}
    </div>
  );
}
