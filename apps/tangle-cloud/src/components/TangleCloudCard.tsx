import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
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
      variant="sandbox"
      className={twMerge(
        'relative z-0 w-full overflow-hidden border-border bg-card',
        'shadow-[var(--shadow-card)] transition-[border-color,background-color,box-shadow] duration-200',
        interactive
          ? 'hover:border-primary/35 hover:bg-card/95 hover:shadow-[var(--shadow-hover)]'
          : null,
        className,
      )}
    >
      <CardContent className="relative z-10 p-5 md:p-6">{children}</CardContent>
    </Card>
  );
};

export default TangleCloudCard;
