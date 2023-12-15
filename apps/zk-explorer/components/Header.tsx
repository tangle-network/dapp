'use client';

import {
  Typography,
  Breadcrumbs,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import { CheckboxBlankCircleLine } from '@webb-tools/icons';
import { FC } from 'react';
import { HeaderActions } from './HeaderActions';

export const Header: FC<unknown> = () => {
  return (
    <header className="py-4 flex flex-col sm:flex-row gap-4">
      {/* TODO: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
          <Typography className="text-mono-60" variant="body1" fw="bold">
            ZK Explorer
          </Typography>
        </BreadcrumbsItem>

        <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
          <Typography className="text-mono-0" variant="body1" fw="bold">
            Upload Project
          </Typography>
        </BreadcrumbsItem>
      </Breadcrumbs>

      <HeaderActions />
    </header>
  );
};
