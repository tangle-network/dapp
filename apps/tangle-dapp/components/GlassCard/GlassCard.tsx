import { Card } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { GlassCardProps } from './types';

const GlassCard: FC<GlassCardProps> = ({ children, className }) => {
  return (
    <Card
      className={twMerge(
        'p-6 space-y-0 rounded-2xl border border-mono-0 dark:border-mono-160 bg-glass dark:bg-glass_dark',
        className
      )}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
