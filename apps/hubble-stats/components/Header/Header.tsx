import { BlockIcon, GridFillIcon } from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Chip,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';

export const Header = () => {
  return (
    <div className="flex items-center justify-between pt-6 pb-4">
      {/* Breadcrumbs */}
      <div>
        <Breadcrumbs>
          <Link href="/">
            <BreadcrumbsItem icon={<GridFillIcon />} isLast>
              Hubble Overview
            </BreadcrumbsItem>
          </Link>
        </Breadcrumbs>
      </div>

      {/* TVL and Volume Chips */}
      <div className="flex items-center gap-4">
        <Chip color="blue">
          <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />{' '}
          TVL: $13,642,124
        </Chip>
        <Chip color="blue">
          <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />{' '}
          volume: $8,562,122
        </Chip>
      </div>
    </div>
  );
};
