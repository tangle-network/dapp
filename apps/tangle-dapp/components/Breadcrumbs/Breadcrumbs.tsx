'use client';

import { isAddress } from '@polkadot/util-crypto';
import {
  CheckboxBlankCircleLine,
  CodeFill,
  FundsLine,
  GiftLineIcon,
  GridFillIcon,
  TokenSwapLineIcon,
} from '@webb-tools/icons';
import { UserFillIcon } from '@webb-tools/icons';
import {
  Breadcrumbs as BreadcrumbsCmp,
  BreadcrumbsItem,
  shortenString,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useMemo } from 'react';

import { PagePath } from '../../types';
import { BreadcrumbType } from './types';

const BREADCRUMB_ICONS: Record<string, BreadcrumbType['icon']> = {
  claim: <GiftLineIcon className="w-4 h-4 lg:w-6 lg:h-6" />,
  account: <UserFillIcon className="w-4 h-4 lg:w-6 lg:h-6" />,
  services: <GridFillIcon className="w-4 h-4 lg:w-6 lg:h-6" />,
  restake: <TokenSwapLineIcon className="w-4 h-4 lg:w-6 lg:h-6" />,
};

const BREADCRUMB_LABELS: Record<string, string> = {
  services: 'Service Overview',
};

const getBreadcrumbLabel = (
  pathName: string,
  index: number,
  pathNames: string[]
) => {
  // Service Details page
  if (pathNames.length === 2 && index === 1 && pathNames[0] === 'services') {
    return `Details: ${pathName}`;
  }
  if (pathName in BREADCRUMB_LABELS) return BREADCRUMB_LABELS[pathName];
  if (isAddress(pathName)) return shortenString(pathName);
  return capitalize(pathName);
};

const getBreadcrumbIcon = (
  pathName: string,
  index: number,
  pathNames: string[]
) => {
  // Service Details page
  if (pathNames.length === 2 && index === 1 && pathNames[0] === 'services') {
    return <CodeFill className="w-4 h-4 lg:w-6 lg:h-6" />;
  }

  if (pathName in BREADCRUMB_ICONS) {
    return BREADCRUMB_ICONS[pathName];
  }

  return <CheckboxBlankCircleLine className="w-4 h-4" />;
};

const Breadcrumbs: FC<{ className?: string }> = ({ className }) => {
  const fullPathname = usePathname();
  const pathNames = fullPathname.split('/').filter((path) => path);

  const breadCrumbs = useMemo<BreadcrumbType[]>(() => {
    if (pathNames.length === 0) {
      return [
        {
          label: 'Nomination',
          isLast: true,
          icon: <FundsLine className="w-4 h-4 lg:w-6 lg:h-6" />,
          href: PagePath.NOMINATION,
        },
      ];
    }

    return pathNames.map((pathName, index) => {
      const icon = getBreadcrumbIcon(pathName, index, pathNames);
      const label = getBreadcrumbLabel(pathName, index, pathNames);

      return {
        label,
        isLast: index === pathNames.length - 1,
        href: `/${pathNames.slice(0, index + 1).join('/')}`,
        icon,
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
