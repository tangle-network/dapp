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
        'w-full max-w-xl min-h-[var(--restake-card-min-height)] h-full',
        'flex flex-col mx-auto space-y-4 grow p-5 md:p-9',
        className,
      )}
    >
      {children}
    </div>
  );
}
