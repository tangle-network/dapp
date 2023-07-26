import { FC, useMemo } from 'react';
import Link from 'next/link';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Chip,
  ChipProps,
  SideBarMenu,
} from '@webb-tools/webb-ui-components';
import { BlockIcon, GridFillIcon, Spinner } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';

import { sideBarProps } from '../../constants';

const Header = () => {
  const tvl = useMemo(() => {
    return 'TVL: $13,642,124';
  }, []);

  const volume = useMemo(() => {
    return 'volume: $8,562,122';
  }, []);

  return (
    <div className="flex items-center justify-between pt-6 pb-4">
      {/* Breadcrumbs */}
      <div className="flex gap-2 items-center">
        <SideBarMenu {...sideBarProps} className="lg:hidden" />
        <Breadcrumbs>
          <Link href="/">
            <BreadcrumbsItem
              icon={<GridFillIcon />}
              className="ml-0 bg-[rgba(156,160,176,0.10)] dark:bg-[rgba(255,255,255,0.05)]"
            >
              Hubble Overview
            </BreadcrumbsItem>
          </Link>
        </Breadcrumbs>
      </div>

      {/* TVL and Volume Chips */}
      <div className="hidden md:flex items-center gap-4">
        <VolumeChip
          color="blue"
          Icon={BlockIcon}
          iconSize="lg"
          iconClassName="stroke-blue-90 dark:stroke-blue-30"
          value={tvl}
          isLoading={tvl ? false : true}
        />
        <VolumeChip
          color="blue"
          Icon={BlockIcon}
          iconSize="lg"
          iconClassName="stroke-blue-90 dark:stroke-blue-30"
          value={volume}
          isLoading={volume ? false : true}
        />
      </div>
    </div>
  );
};

type VolumeChipProps = {
  color: ChipProps['color'];
  className?: string;
  Icon: (props: IconBase) => JSX.Element;
  iconClassName?: string;
  iconSize?: IconBase['size'];
  value: string;
  isLoading?: boolean;
};

export const VolumeChip: FC<VolumeChipProps> = ({
  color,
  className,
  Icon,
  iconClassName,
  iconSize = 'md',
  value,
  isLoading,
}) => {
  return (
    <Chip color={color} className={className}>
      <Icon size={iconSize} className={iconClassName} />
      {isLoading ? <Spinner size="md" /> : value}
    </Chip>
  );
};

export default Header;
