'use client';

import { CheckCircledIcon, CircleIcon } from '@radix-ui/react-icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { RelativePageUrl, getPathBreadcrumbNames, isPageUrl } from '../utils';

const ComputedBreadcrumbs: FC = () => {
  const pathName = usePathname();

  // Remove the first slash and any trailing slashes.
  const pathSegments = pathName.split('/').filter((segment) => segment !== '');

  const segmentBreadcrumbs = getPathBreadcrumbNames(pathSegments);

  const breadcrumbs = segmentBreadcrumbs.map((segmentName, index) => {
    const isLast = index === segmentBreadcrumbs.length - 1;

    const possiblyKnownHref =
      // For the last segment, don't link to anything.
      isLast ? '#' : `/${pathSegments.slice(0, index + 1).join('/')}`;

    // If the href is a known page URL, attach a link to it.
    // Otherwise, don't link to anything, since it is an unknown URL,
    // and thus could lead to a 404 page.
    const href = isPageUrl(possiblyKnownHref) ? possiblyKnownHref : '#';

    const icon = isLast ? <CheckCircledIcon /> : <CircleIcon />;

    return (
      <Link key={index} href={href}>
        <BreadcrumbsItem isLast={isLast} icon={icon}>
          <Typography variant="body1" fw="bold" className="normal-case">
            {segmentName}
          </Typography>
        </BreadcrumbsItem>
      </Link>
    );
  });

  return (
    <Breadcrumbs>
      <Link href={RelativePageUrl.Root}>
        <BreadcrumbsItem icon={<CircleIcon />}>
          <Typography variant="body1" fw="bold">
            ZK Explorer
          </Typography>
        </BreadcrumbsItem>
      </Link>

      {breadcrumbs}
    </Breadcrumbs>
  );
};

export default ComputedBreadcrumbs;
