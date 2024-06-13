import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import type { TabsContainerProps } from './types';

export default function TabsContainer({
  className,
  tabs,
  children,
  activeTab,
  ...props
}: TabsContainerProps) {
  return (
    <div
      {...props}
      className={twMerge(
        'w-full max-w-xl min-h-[var(--restake-card-min-height)]',
        'h-full bg-mono-0 dark:bg-[#1F1D2B]/90',
        'mx-auto rounded-xl space-y-4 grow',
        'border border-mono-40 dark:border-mono-190 p-5 md:p-9',
        'flex flex-col',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        className,
      )}
    >
      <ul className="flex items-center gap-4 overflow-x-scroll">
        {tabs.map((tab, idx) => (
          <li key={`${tab}-${idx}`}>
            <Link
              href={tab}
              className={twMerge(
                'h4 font-bold',
                activeTab === tab
                  ? 'text-mono-200 dark:text-mono-0'
                  : 'text-mono-100',
              )}
            >
              {`${tab[0].toUpperCase()}${tab.substring(1)}`}
            </Link>
          </li>
        ))}
      </ul>

      {children}
    </div>
  );
}
