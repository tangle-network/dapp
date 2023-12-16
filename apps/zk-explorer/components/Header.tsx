'use client';

import {
  Typography,
  Breadcrumbs,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import { CheckboxBlankCircleLine } from '@webb-tools/icons';
import { FC } from 'react';
import { HeaderActions } from './HeaderActions';
import { PageUrl } from '../utils/utils';
import { Link } from '@webb-tools/webb-ui-components/components/Link';

export const Header: FC<unknown> = () => {
  return (
    <header className="py-4 flex flex-col sm:flex-row gap-4">
      {/* TODO: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <Link href={PageUrl.Home}>
          <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
            <Typography variant="body1" fw="bold">
              ZK Explorer
            </Typography>
          </BreadcrumbsItem>
        </Link>

        <Link href={PageUrl.SubmitProject}>
          <BreadcrumbsItem icon={<CheckboxBlankCircleLine />} isLast>
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
