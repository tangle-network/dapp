'use client';

import { FC, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import { CoinIcon, ContrastLine } from '@webb-tools/icons';

import { BreadcrumbType } from './types';

const Breadcrumbs: FC = () => {
  const pathname = usePathname();

  const breadCrumbs = useMemo(() => {
    const parts = pathname.split('/');
    const activeItem = parts[parts.length - 1];

    const breadCrumbItems: BreadcrumbType[] = [
      {
        label: 'Hubble Overview',
        isLast: activeItem !== '' ? false : true,
        icon: (
          <ContrastLine className={activeItem !== '' ? 'fill-mono-120' : ''} />
        ),
        href: '/',
      },
    ];

    if (activeItem !== '') {
      breadCrumbItems.push({
        label: activeItem,
        isLast: true,
        icon: <CoinIcon />,
        href: '',
      });
    }

    return breadCrumbItems;
  }, [pathname]);

  return (
    <BreadcrumbsCmp>
      {breadCrumbs.map((breadcrumb, index) => (
        <Link key={index} href={breadcrumb.href}>
          <BreadcrumbsItem
            icon={breadcrumb.icon}
            className={breadcrumb.className}
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
