import { Card } from '@webb-tools/webb-ui-components/components/Card';
import { type ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import TangleBigLogo from '../TangleBigLogo';
import { TangleCardProps } from './types';

const TangleCard = forwardRef<ElementRef<'div'>, TangleCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Card
        {...props}
        ref={ref}
        className={twMerge(
          'w-full flex items-center md:max-w-[556px] overflow-hidden space-y-0',
          'relative rounded-2xl shadow-sm border p-6',
          'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
          className
        )}
      >
        {children}

        <TangleBigLogo className="absolute top-[50%] translate-y-[-50%] right-0 rounded-br-2xl" />
      </Card>
    );
  }
);

TangleCard.displayName = 'TangleCard';

export default TangleCard;
