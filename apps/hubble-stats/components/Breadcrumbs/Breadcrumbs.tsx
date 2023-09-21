'use client';

import { FC, useMemo } from 'react';
import cx from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import { CoinIcon, ContrastLine } from '@webb-tools/icons';

import { VANCHORS_MAP } from '../../constants';
import { BreadcrumbType } from './types';

const Breadcrumbs: FC = () => {
  const pathname = usePathname();

  const breadCrumbs = useMemo<BreadcrumbType[]>(() => {
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
    <BreadcrumbsCmp>
      {breadCrumbs.map((breadcrumb, index) => (
        <Link key={index} href={breadcrumb.href}>
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
