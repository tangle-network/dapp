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
        className={twMerge(
          'group select-none rounded-full',
          isDisabled && 'pointer-events-none',
          !isExpanded ? 'px-2 py-3' : 'flex items-center',
          isActive && (subItemsCount === 0 || !isExpanded)
            ? 'text-mono-200 dark:text-mono-0'
            : 'text-mono-100 dark:text-mono-120',
          isExpanded && 'hover:bg-mono-20 dark:hover:bg-mono-190',
          isExpanded ? 'justify-between px-4 py-3' : 'justify-center',
          isActive &&
            (subItemsCount === 0 || !isExpanded) &&
            'bg-mono-20 dark:bg-mono-190',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

export default StyledItem;
