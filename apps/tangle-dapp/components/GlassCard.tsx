import { Card } from '@webb-tools/webb-ui-components/components/Card';
import { ComponentProps, ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export type GlassCardProps = ComponentProps<'div'>;

const GlassCard = forwardRef<ElementRef<'div'>, GlassCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Card
        {...props}
        ref={ref}
        className={twMerge(
          'p-6 space-y-0 rounded-2xl border border-mono-0 dark:border-mono-160',
          'bg-glass dark:bg-glass_dark backdrop-blur-2xl',
          className,
        )}
      >
        {children}
      </Card>
    );
  },
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
