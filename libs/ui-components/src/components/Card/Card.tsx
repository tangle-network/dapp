import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ComponentBase } from '../../types';
import CardVariant from './CardVariant';

export type CardProps = ComponentBase & {
  variant?: CardVariant;
  withShadow?: boolean;
  tightPadding?: boolean;
};

const getVariantClass = (variant: CardVariant): string => {
  switch (variant) {
    case CardVariant.GLASS:
      return [
        'p-6 rounded-2xl',
        // Solid surface (was frosted-glass: translucent bg + gradient overlay +
        // backdrop-blur). The frost read as an inconsistent sheen on dark apps
        // (cloud); solid keeps a single consistent card surface everywhere.
        'border border-mono-60 dark:border-mono-170',
        'bg-mono-0 dark:bg-mono-180',
        'shadow-[0_10px_60px_rgba(17,24,39,0.10)]',
        'dark:shadow-[0_14px_70px_rgba(0,0,0,0.45)]',
      ].join(' ');
    case CardVariant.DEFAULT:
      return '';
  }
};

/**
 * Sets up styles, and spacing vertically between `block` components.
 *
 * @example
 *
 * ```jsx
 *  <Card>
 *    ...
 *  </Card>
 *
 * <Card>
 *   <TitleWithInfo title='Token Selector' variant='h4' />
 *
 *   <div className='flex items-center space-x-4'>
 *     <TokenSelector>ETH</TokenSelector>
 *     <TokenSelector>DOT</TokenSelector>
 *     <TokenSelector isActive>KSM</TokenSelector>
 *   </div>
 * </Card>;
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      withShadow = false,
      tightPadding = false,
      variant = CardVariant.DEFAULT,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        className={twMerge(
          'rounded-xl',
          'bg-mono-0 dark:bg-mono-200',
          'border border-mono-60 dark:border-mono-170',
          withShadow && 'shadow-tangle',
          tightPadding ? 'p-3' : 'p-6',
          getVariantClass(variant),
          className,
        )}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);
