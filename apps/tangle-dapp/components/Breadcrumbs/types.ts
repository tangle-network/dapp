import type { IconBase } from '@webb-tools/icons/types';
import type React from 'react';

export type BreadcrumbType = {
  label: string;
  isLast: boolean;
  icon: React.ReactElement<IconBase>;
  href: string;
  className?: string;
};
