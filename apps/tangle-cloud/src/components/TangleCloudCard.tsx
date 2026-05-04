import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type TangleCloudCardProps = PropsWithChildren<{ className?: string }>;

const TangleCloudCard: FC<TangleCloudCardProps> = ({ children, className }) => {
  return (
    <Card
      variant="sandbox"
      className={twMerge(
        'relative z-0 w-full overflow-hidden transition-shadow duration-300',
        'border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)]',
        className,
      )}
    >
      <CardContent className="relative z-10 p-5 md:p-6">{children}</CardContent>
    </Card>
  );
};

export default TangleCloudCard;
