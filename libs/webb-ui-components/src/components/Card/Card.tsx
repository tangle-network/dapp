import React from 'react';
import { twMerge } from 'tailwind-merge';
import { WebbComponentBase } from '../../types';

export enum CardVariant {
  DEFAULT,
  GLASS,
}

export type CardProps = WebbComponentBase & {
  variant?: CardVariant;
  withShadow?: boolean;
};

const getVariantClass = (variant: CardVariant) => {
  switch (variant) {
    case CardVariant.GLASS:
      return 'p-6 rounded-2xl border border-mono-0 dark:border-mono-160 bg-glass dark:bg-glass_dark backdrop-blur-2xl';
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
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      withShadow = false,
      variant = CardVariant.DEFAULT,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-6 rounded-xl',
          'bg-mono-0 dark:bg-mono-200',
          'border border-mono-60 dark:border-mono-170',
          withShadow && 'shadow-webb-lg dark:shadow-webb-lg-dark',
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
