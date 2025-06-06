import type { PropsOf } from '@tangle-network/ui-components/types';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsOf<'li'> & {
  isActive?: boolean;
  href?: ComponentProps<typeof Link>['to'];
  hideSeparator?: boolean;
};

const TabListItem: FC<Props> = ({
  className,
  isActive,
  children,
  href,
  hideSeparator,
  ...props
}) => {
  const content = (
    <>
      {isActive && (
        <motion.span
          layoutId="bubble"
          className="absolute inset-0 rounded-lg bg-mono-0 dark:bg-blue-120"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}

      <span
        className={twMerge(
          'absolute body1 w-full py-1 text-center',
          isActive && 'font-bold',
          isActive
            ? 'text-mono-200 dark:text-blue-50'
            : 'text-mono-120 dark:text-mono-80',
        )}
      >
        {children}
      </span>
    </>
  );

  const contentWrapperClass = 'relative transition grow';

  return (
    <li
      {...props}
      role="tab"
      aria-selected={isActive}
      className={twMerge(
        'relative p-1 flex-1 flex justify-center grow min-h-[45px] border-x border-transparent',
        "after:content-[''] after:w-[1px] after:h-7",
        'after:absolute after:-right-[1.5px] after:top-1/2 after:-translate-y-1/2',
        'after:bg-mono-60 dark:after:bg-mono-170',
        'last:after:hidden',
        (isActive || hideSeparator) && 'after:hidden',
        className,
      )}
    >
      {href === undefined ? (
        <div className={twMerge('cursor-pointer', contentWrapperClass)}>
          {content}
        </div>
      ) : (
        <Link to={href} className={contentWrapperClass}>
          {content}
        </Link>
      )}
    </li>
  );
};

export default TabListItem;
