import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TimeLineProps } from './types';

/**
 * The `TimeLine` style wrapper
 *
 * @example
 *
 * ```jsx
 *    <TimeLine>
 *      <TimeLineItem
 *        title='Proposed'
 *        time={randRecentDate()}
 *        txHash={randEthereumAddress()}
 *        externalUrl='https://webb.tools'
 *      />
 *    </TimeLine>
 * ```
 */
export const TimeLine = forwardRef<HTMLDivElement, TimeLineProps>(({ children, className, ...props }, ref) => {
  return (
    <div
      {...props}
      className={twMerge('flex flex-col space-y-2 border-l border-blue dark:border-blue-30', className)}
      ref={ref}
    >
      {children}
    </div>
  );
});
