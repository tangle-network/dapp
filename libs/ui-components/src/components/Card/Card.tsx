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
      return 'p-6 rounded-2xl border border-mono-0 dark:border-mono-160 bg-glass dark:bg-glass_dark';
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
