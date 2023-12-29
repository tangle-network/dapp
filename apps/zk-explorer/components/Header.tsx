'use client';

import {
  Typography,
  Breadcrumbs,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { HeaderActions } from './HeaderActions';
import { PageUrl } from '../utils/utils';
import { CircleIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export const Header: FC<unknown> = () => {
  return (
    <header className="py-4 flex flex-col-reverse sm:flex-row justify-between gap-4">
      {/* TODO now: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <Link href={PageUrl.Home}>
          <BreadcrumbsItem icon={<CircleIcon />}>
            <Typography variant="body1" fw="bold">
              ZK Explorer
            </Typography>
          </BreadcrumbsItem>
        </Link>

        <Link href={PageUrl.SubmitProject}>
          <BreadcrumbsItem icon={<CircleIcon />} isLast>
            <Typography variant="body1" fw="bold">
              Upload Project
            </Typography>
          </BreadcrumbsItem>
        </Link>
      </Breadcrumbs>

      <HeaderActions />
    </header>
  );
};
