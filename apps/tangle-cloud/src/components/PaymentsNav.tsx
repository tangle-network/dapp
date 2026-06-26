import { FC } from 'react';
import { Link, useLocation } from 'react-router';
import { PagePath } from '../types';

const TABS = [
  { label: 'Shielded Pool', href: PagePath.PAYMENTS_POOL },
  { label: 'Credits', href: PagePath.PAYMENTS_CREDITS },
];

const PaymentsNav: FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-1 rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors ${
              active
                ? 'bg-mono-0 text-mono-200 dark:bg-mono-180 dark:text-mono-0'
                : 'text-mono-100 dark:text-mono-60 hover:text-mono-200 dark:hover:text-mono-0'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default PaymentsNav;
