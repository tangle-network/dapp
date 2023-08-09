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
  const parts = pathname.split('/');
  let activeItem = parts[parts.length - 1];

  if (parts.length === 3 && parts[0] === '' && parts[1] === 'pool') {
    // TODO: handle getting pool name from address and redirect user if invalid address
    activeItem = 'webbParachain';
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
        textClassName: '!text-[12px] lg:!text-[16px]',
      },
    ];

    if (activeItem !== '') {
      breadCrumbItems.push({
        label: activeItem,
        isLast: true,
        icon: <CoinIcon />,
        href: '',
        textClassName: '!text-[12px] lg:!text-[16px]',
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
