import { Card, CardVariant } from '@tangle-network/ui-components';
import { type CSSProperties, FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type TangleCloudCardProps = PropsWithChildren<{
  className?: string;
  interactive?: boolean;
  style?: CSSProperties;
  id?: string;
}>;

/**
 * Pure pass-through to the shared Card GLASS variant — same component the
 * staking dapp uses everywhere. No custom padding, overflow, or positioning
 * that would diverge from the shared design system.
 */
const TangleCloudCard: FC<TangleCloudCardProps> = ({
  children,
  className,
  interactive = false,
  style,
  id,
}) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      withShadow
      id={id}
      style={style}
      className={twMerge(
        interactive &&
          'transition-shadow duration-200 hover:shadow-[0_16px_70px_rgba(0,0,0,0.50)]',
        className,
      )}
    >
      {children}
    </Card>
  );
};

export default TangleCloudCard;
