import cx from 'classnames';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { TabProps, TabsProps } from './types';

/**
 * The `Tabs` component
 *
 * @example
 *
 * ```jsx
 *
 *  <Tabs value={['all', 'for', 'against', 'abstain']} />
 *
 * ```
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({ className, onChange, value, ...props }, ref) => {
  const [selectedTab, setSelectedTab] = useState(value[0]);

  const onTabChange = useCallback(
    (nextValue: string) => {
      setSelectedTab(nextValue);

      onChange?.(nextValue);
    },
    [onChange]
  );

  const tabs = useMemo(() => value, [value]);

  const mergedClsx = useMemo(() => twMerge('flex items-center space-x-2', className), [className]);

  // Update the default selected tab when `value` prop change
  useEffect(() => {
    setSelectedTab(value[0]);
  }, [value]);

  return (
    <div {...props} className={mergedClsx} ref={ref}>
      {tabs.map((tab, idx) => {
        return (
          <Tab key={`${tab}-${idx}`} isActive={selectedTab === tab} onClick={() => onTabChange(tab)}>
            {tab}
          </Tab>
        );
      })}
    </div>
  );
});

/**
 * The `Tab` component
 */
const Tab = forwardRef<HTMLButtonElement, TabProps>(({ children, className, isActive, ...props }, ref) => {
  return (
    <button
      {...props}
      disabled={isActive}
      className={twMerge(
        cx(
          'flex items-center justify-center grow shrink basis-0',
          'py-2 font-bold rounded-lg body2',
          'text-mono-120 dark:text-mono-80 bg-mono-0 dark:bg-mono-180',
          'disabled:bg-blue-0 dark:disabled:bg-blue-120 disabled:text-blue-70 dark:disabled:text-blue-50'
        ),
        className
      )}
      ref={ref}
    >
      <span className='inline-block !text-inherit'>{children}</span>
    </button>
  );
});
