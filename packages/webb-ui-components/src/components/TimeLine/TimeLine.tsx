import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TimeLineProps } from './types';

/**
 * The `TimeLine` style wrapper
 *
 *  Props:
 *
 * - `title`: The timeline title
 * - `time`: The actual time the event happens
 * - `txHash`: The transaction hash
 * - `externalUrl`: The extra content to display under the tx hash section
 * - `extraContent`: If added, the button will show an icon before the button's label
 * - `isLoading`: If `true`, the spinner icon will be displayed
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
      className={twMerge(
        'flex flex-col space-y-2 border-l border-blue dark:border-blue-30',
        'translate-x-3 transalte-y-0.5',
        className
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});
