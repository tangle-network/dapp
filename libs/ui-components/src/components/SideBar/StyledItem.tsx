import { twMerge } from 'tailwind-merge';
import forwardRef from '../../utils/forwardRef';
import { StyledSideBarItemProps } from './types';

const StyledItem = forwardRef<HTMLDivElement, StyledSideBarItemProps>(
  (
    {
      isActive,
      isDisabled,
      isExpanded,
      subItemsCount = 0,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        ref={ref}
        data-active={isActive || undefined}
        className={twMerge(
          'group select-none rounded-full',
          isDisabled && 'pointer-events-none',
          !isExpanded ? 'px-2 py-3' : 'flex items-center',
          isActive && (subItemsCount === 0 || !isExpanded)
            ? 'text-white dark:text-white font-semibold bg-indigo-500/40 dark:bg-indigo-500/40 border-l-4 border-indigo-400 rounded-l-none'
            : 'text-mono-100 dark:text-mono-120',
          isExpanded && 'hover:bg-mono-20 dark:hover:bg-mono-190',
          isExpanded ? 'justify-between px-4 py-3' : 'justify-center',
          isActive && (subItemsCount === 0 || !isExpanded) && '',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

export default StyledItem;
