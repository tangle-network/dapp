'use client';

import { FC, useMemo } from 'react';
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
  const parts = pathname.split('/');
  let activeItem = parts[parts.length - 1];

  // check if current path is /pool/<poolAddress>
  if (parts.length === 3 && parts[0] === '' && parts[1] === 'pool') {
    const poolAddress = parts[2];
    // if invalid poolAddress, the breadcrumb only show the default item
    if (!VANCHORS_MAP[poolAddress]) {
      activeItem = '';
    } else {
      activeItem = VANCHORS_MAP[poolAddress].fungibleTokenName;
    }
  }

  const breadCrumbs = useMemo(() => {
    const breadCrumbItems: BreadcrumbType[] = [
      {
        label: 'Hubble Overview',
        isLast: activeItem === '',
        icon: (
          <ContrastLine className={activeItem !== '' ? 'fill-mono-120' : ''} />
        ),
        href: '/',
        textClassName: '!text-[12px] lg:!text-[16px] normal-case',
      },
    ];

    if (activeItem !== '') {
      breadCrumbItems.push({
        label: activeItem,
        isLast: true,
        icon: <CoinIcon />,
        href: '',
        textClassName: '!text-[12px] lg:!text-[16px] normal-case',
      });
    }

    return breadCrumbItems;
  }, [activeItem]);

  return (
    <BreadcrumbsCmp>
      {breadCrumbs.map((breadcrumb, index) => (
        <Link key={index} href={breadcrumb.href}>
          <BreadcrumbsItem
            icon={breadcrumb.icon}
            className={breadcrumb.className}
            textClassName={breadcrumb.textClassName}
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
