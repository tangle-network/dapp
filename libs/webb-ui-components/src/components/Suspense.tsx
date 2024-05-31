import { Spinner } from '@webb-tools/icons/Spinner';
import { Suspense as ReactSuspense, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';
import type { PropsOf } from '../types';

function Suspense({ children, ...props }: PropsWithChildren<PropsOf<'div'>>) {
  return (
    <ReactSuspense
      fallback={
        <div
          {...props}
          className={twMerge(
            'flex items-center justify-center min-w-full min-h-screen',
            props.className,
          )}
        >
          <Spinner size="xl" />
        </div>
      }
    >
      {children}
    </ReactSuspense>
  );
}

export default Suspense;
