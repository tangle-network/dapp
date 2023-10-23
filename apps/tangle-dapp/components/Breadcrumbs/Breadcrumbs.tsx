'use client';

import { FundsLine } from '@webb-tools/icons';
import { getIconSizeInPixel } from '@webb-tools/icons/utils';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import Link from 'next/link';
import { type FC, useMemo } from 'react';

import { BreadcrumbType } from './types';

const Breadcrumbs: FC = () => {
  const breadCrumbs = useMemo<BreadcrumbType[]>(() => {
    const md = getIconSizeInPixel('md');
    const lg = getIconSizeInPixel('lg');

    return [
      {
        label: 'EVM Staking',
        isLast: true,
        icon: (
          <FundsLine
            className={`w-[${md}] h-[${md}] lg:w-[${lg}] lg:h-[${lg}]`}
          />
        ),
        href: '/',
      },
    ];
  }, []);

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
