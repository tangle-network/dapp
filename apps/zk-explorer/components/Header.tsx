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

export const Header: FC<unknown> = () => {
  return (
    <header className="py-4 flex flex-col sm:flex-row gap-4">
      {/* TODO: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <a href={PageUrl.Home}>
          <BreadcrumbsItem icon={<CircleIcon />}>
            <Typography variant="body1" fw="bold">
              ZK Explorer
            </Typography>
          </BreadcrumbsItem>
        </a>

        <a href={PageUrl.SubmitProject}>
          <BreadcrumbsItem icon={<CircleIcon />} isLast>
            <Typography variant="body1" fw="bold">
              Upload Project
            </Typography>
          </BreadcrumbsItem>
        </a>
      </Breadcrumbs>

      <HeaderActions />
    </header>
  );
};
