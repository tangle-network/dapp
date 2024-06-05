'use client';

import { IconBase } from '@webb-tools/icons/types';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactElement, useMemo } from 'react';

import { getBreadcrumbIcon, getBreadcrumbLabel } from './utils';

export type BreadcrumbType = {
  label: string;
  isLast: boolean;
  icon?: ReactElement<IconBase> | null;
  href: string;
  className?: string;
};

const Breadcrumbs: FC<{ className?: string }> = ({ className }) => {
  const fullPathname = usePathname();
  const pathNames = fullPathname.split('/').filter(segment => segment.trim() !== '');

  const breadCrumbs = useMemo<BreadcrumbType[]>(() => {
    return pathNames.map((pathName, index) => {
      const Icon = getBreadcrumbIcon(pathName, index, pathNames);
      const label = getBreadcrumbLabel(pathName, index, pathNames);

      return {
        label,
        isLast: index === pathNames.length - 1,
        href: `/${pathNames.slice(0, index + 1).join('/')}`,
        icon: <Icon className="w-4 h-4 lg:w-6 lg:h-6" />,
      };
    });
  }, [pathNames]);

  return (
    <div className={className}>
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
    </div>
  );
};

export default Breadcrumbs;
