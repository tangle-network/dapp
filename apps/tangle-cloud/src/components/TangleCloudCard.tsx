import { Card, CardVariant } from '@tangle-network/ui-components';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type TangleCloudCardProps = PropsWithChildren<{
  className?: string;
  interactive?: boolean;
}>;

const TangleCloudCard: FC<TangleCloudCardProps> = ({
  children,
  className,
  interactive = false,
}) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      withShadow
      className={twMerge(
        'relative z-0 w-full overflow-hidden p-5 md:p-6',
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
