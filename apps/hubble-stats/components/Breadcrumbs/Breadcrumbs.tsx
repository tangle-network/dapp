'use client';

import { CoinIcon, ContrastLine } from '@webb-tools/icons';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type FC } from 'react';

import { VANCHORS_MAP } from '../../constants';
import type { BreadcrumbsType, BreadcrumbItemType } from './types';

const Breadcrumbs: FC<BreadcrumbsType> = ({ className }) => {
  const pathname = usePathname();

  const breadCrumbs = useMemo<BreadcrumbItemType[]>(() => {
    // check if current path is /pool/<0x...>
    if (/^\/pool\/0x\w+/.test(pathname)) {
      const poolAddress = pathname.split('/')[2];
      if (VANCHORS_MAP[poolAddress]) {
        return [
          {
            label: 'Hubble Overview',
            isLast: false,
            icon: <ContrastLine className="!fill-mono-120" />,
            href: '/',
          },
          {
            label: VANCHORS_MAP[poolAddress].fungibleTokenName,
            isLast: true,
            icon: <CoinIcon />,
            href: '#',
          },
        ];
      }
    }

    return [
      {
        label: 'Hubble Overview',
        isLast: true,
        icon: <ContrastLine />,
        href: '/',
      },
    ];
  }, [pathname]);

  return (
    <BreadcrumbsCmp className={className}>
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
