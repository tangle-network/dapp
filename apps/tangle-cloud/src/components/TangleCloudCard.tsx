import { Card, CardVariant } from '@tangle-network/ui-components';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type TangleCloudCardProps = PropsWithChildren<{ className?: string }>;

const TangleCloudCard: FC<TangleCloudCardProps> = ({ children, className }) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(
        'relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300',
        'w-full xl:w-1/2 p-6 z-0',
        'border border-mono-40 dark:border-mono-160',
        'backdrop-blur-sm',
        className,
      )}
    >
      <span className="relative z-10 w-full">{children}</span>

      <span
        className={twMerge(
          'absolute top-0 left-0 w-full h-full z-0',
          "dark:bg-[url('/static/assets/accounts/grid-bg-colored.svg')]",
          'bg-cover bg-center bg-no-repeat',
          'bg-gradient-to-br from-blue-5 via-mono-10 to-purple-5',
          'dark:bg-gradient-to-br dark:from-blue-180 dark:via-mono-180 dark:to-purple-180',
          'opacity-60 dark:opacity-40',
          'shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)]',
          'dark:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.40)]',
          'dark:bg-blend-overlay',
        )}
      />
    </Card>
  );
};

export default TangleCloudCard;
