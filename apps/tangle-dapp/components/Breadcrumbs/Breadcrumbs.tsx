'use client';

import { FundsLine } from '@webb-tools/icons';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type FC, useMemo, useEffect } from 'react';
import { BreadcrumbType } from './types';
import { getIconSizeInPixel } from '@webb-tools/icons/utils';

const Breadcrumbs: FC = () => {
  const router = useRouter();
  const pathname = usePathname();

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

  /**
   * Pages not reload server data when navigating to a page when go back and forth in the browser
   * Therefore, need to refresh the page when the user navigates to a page
   * This keeps all client-side components still remain their states
   */
  useEffect(() => {
    router.refresh();
  }, [router, pathname]);

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
