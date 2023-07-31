import { BlockIcon, CoinIcon, ContrastLine, Spinner } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Chip,
  ChipProps,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { HeaderProps, Breadcrumb } from './types';
import { usePathname } from 'next/navigation';

const Header = ({ tvlValue, volumeValue }: HeaderProps) => {
  const pathname = usePathname();

  const breadCrumbs = useMemo(() => {
    const parts = pathname.split('/');
    const activeItem = parts[parts.length - 1];

    const breadCrumbItems: Breadcrumb[] = [
      {
        label: 'Hubble Overview',
        isLast: activeItem !== '' ? false : true,
        icon: (
          <ContrastLine className={activeItem !== '' ? 'fill-mono-120' : ''} />
        ),
        href: '/',
      },
    ];

    if (activeItem !== '') {
      breadCrumbItems.push({
        label: activeItem,
        isLast: true,
        icon: <CoinIcon />,
        href: '',
      });
    }

    return breadCrumbItems;
  }, [pathname]);

  return (
    <div className="flex items-center justify-between pt-6 pb-4">
      {/* Breadcrumbs */}
      <div>
        <Breadcrumbs>
          {breadCrumbs.map((breadcrumb, index) => (
            <Link key={index} href={breadcrumb.href}>
              <BreadcrumbsItem
                icon={breadcrumb.icon}
                className={breadcrumb.className}
                isLast={breadcrumb.isLast}
              >
                {breadcrumb.label}
              </BreadcrumbsItem>
            </Link>
          ))}
        </Breadcrumbs>
      </div>

      {/* TVL and Volume Chips */}
      <div className="flex items-center gap-4">
        <VolumeChip
          color="blue"
          Icon={BlockIcon}
          iconSize="lg"
          iconClassName="stroke-blue-90 dark:stroke-blue-30"
          value={tvlValue}
          isLoading={tvlValue ? false : true}
        />
        <VolumeChip
          color="blue"
          Icon={BlockIcon}
          iconSize="lg"
          iconClassName="stroke-blue-90 dark:stroke-blue-30"
          value={volumeValue}
          isLoading={volumeValue ? false : true}
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

export const VolumeChip: React.FC<VolumeChipProps> = ({
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
