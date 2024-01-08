'use client';

import { FundsLine, GiftLineIcon } from '@webb-tools/icons';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC, useMemo } from 'react';

import { BreadcrumbType } from './types';

const BREADCRUMB_ICONS: Record<string, BreadcrumbType['icon']> = {
  claim: <GiftLineIcon className="w-4 h-4 lg:w-6 lg:h-6" />,
};

const Breadcrumbs: FC = () => {
  const fullPathname = usePathname();
  const pathNames = fullPathname.split('/').filter((path) => path);

  const breadCrumbs = useMemo<BreadcrumbType[]>(() => {
    if (pathNames.length === 0) {
      return [
        {
          label: 'EVM Staking',
          isLast: true,
          icon: <FundsLine className="w-4 h-4 lg:w-6 lg:h-6" />,
          href: '/',
        },
      ];
    }

    return pathNames.map((pathName, index) => {
      const icon =
        pathName in BREADCRUMB_ICONS ? BREADCRUMB_ICONS[pathName] : null;

      return {
        label: capitalize(pathName),
        isLast: index === pathNames.length - 1,
        href: `/${pathNames.slice(0, index + 1).join('/')}`,
        icon,
      };
    });
  }, [pathNames]);

  return (
    <BreadcrumbsCmp>
      {breadCrumbs.map((breadcrumb, index) => (
        /**
         * Data on the client-side needs to be up-to-date when the user navigates to a page
         * Therefore, do not need to prefetch routes in breadcrumb items
         */
        <Link key={index} href={breadcrumb.href} prefetch={false}>
          <BreadcrumbsItem
            icon={breadcrumb.icon}
            className={cx('whitespace-nowrap', breadcrumb.className)}
            textClassName="!text-[12px] lg:!text-[16px] normal-case"
            isLast={breadcrumb.isLast}
          >
            {breadcrumb.label}
          </BreadcrumbsItem>
        </Link>
      ))}
    </BreadcrumbsCmp>
  );
};

export default Breadcrumbs;
