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
        // Softer “frosted” surface (color + highlight gradient) with true backdrop blur.
        'border border-white/55 dark:border-white/10',
        'bg-white/65 dark:bg-mono-200/40',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.55)_100%)]',
        'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.78)_0%,rgba(29,29,43,0.45)_100%)]',
        'backdrop-blur-[18px]',
        // Depth similar to the dashboard comps.
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
