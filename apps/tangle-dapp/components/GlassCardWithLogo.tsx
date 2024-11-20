import { ComponentProps, type ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from './GlassCard';
import TangleBigLogo from './TangleBigLogo';

export type GlassCardWithLogoProps = ComponentProps<'div'>;

const GlassCardWithLogo = forwardRef<ElementRef<'div'>, GlassCardWithLogoProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <GlassCard
        {...props}
        ref={ref}
        className={twMerge(
          'w-full flex items-center md:max-w-[556px] overflow-hidden space-y-0',
          'relative rounded-2xl shadow-sm border p-6',
          'border-mono-0 dark:border-mono-160',
          className,
        )}
      >
        {children}

        <TangleBigLogo className="absolute top-[50%] translate-y-[-50%] right-0 rounded-br-2xl" />
      </GlassCard>
    );
  },
);

GlassCardWithLogo.displayName = 'GlassCardWithLogo';

export default GlassCardWithLogo;
