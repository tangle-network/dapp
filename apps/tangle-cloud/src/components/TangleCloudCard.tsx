import { Card, CardVariant } from '@tangle-network/ui-components';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type TangleCloudCardProps = PropsWithChildren<{ className?: string }>;

const TangleCloudCard: FC<TangleCloudCardProps> = ({ children, className }) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(
        'relative overflow-hidden shadow-sm',
        'w-full xl:w-1/2 p-5 z-0',
        className,
      )}
    >
      <span className="relative z-10 w-full">{children}</span>

      <span
        className={twMerge(
          'absolute top-0 left-0 w-full h-full z-0',
          "dark:bg-[url('/static/assets/accounts/grid-bg-colored.svg')]",
          'bg-cover bg-center bg-no-repeat',
          'bg-gradient-to-b from-mono-0.7 to-transparent',
          'shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)]',
          'dark:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.20)]',
          'dark:bg-blend-lighten',
        )}
      />
    </Card>
  );
};

export default TangleCloudCard;
