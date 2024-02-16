'use client';

import { isAddress } from '@polkadot/util-crypto';
import {
  CheckboxBlankCircleLine,
  FundsLine,
  GiftLineIcon,
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
          href: PagePath.Nominations,
        },
      ];
    }

    return pathNames.map((pathName, index) => {
      const icon =
        pathName in BREADCRUMB_ICONS ? (
          BREADCRUMB_ICONS[pathName]
        ) : (
          <CheckboxBlankCircleLine className="w-4 h-4" />
        );

      return {
        label: isAddress(pathName)
          ? shortenString(pathName)
          : capitalize(pathName),
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
