import { Card as SharedCard } from '@tangle-network/ui/primitives';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ComponentBase } from '../../types';
import CardVariant from './CardVariant';

export type CardProps = ComponentBase & {
  variant?: CardVariant;
  withShadow?: boolean;
  tightPadding?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      withShadow = false,
      tightPadding = false,
      variant = CardVariant.DEFAULT,
      ...props
    },
    ref,
  ) => (
    <SharedCard
      {...props}
      ref={ref}
      variant={
        withShadow || variant === CardVariant.GLASS ? 'elevated' : 'default'
      }
      className={twMerge(tightPadding ? 'p-3' : 'p-6', className)}
    />
  ),
);
