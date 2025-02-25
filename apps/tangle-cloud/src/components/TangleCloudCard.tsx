import { Card, CardVariant } from '@tangle-network/ui-components';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const TangleCloudCard: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(
        'relative w-full flex items-center md:max-w-[556px] overflow-hidden shadow-sm',
        className,
      )}
    >
      <span className='relative z-10'>
        {children}
      </span>

      <span
        className={twMerge(
          'absolute top-0 left-0 w-full h-full z-0',
          "!bg-[url('/static/assets/blueprints/grid-bg-colored.png')]",
          "bg-cover bg-center bg-no-repeat",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-[rgba(12,10,56,0.20)] before:to-[rgba(30,25,138,0.20)]",
          "after:absolute after:inset-0 after:bg-gradient-to-b after:from-[rgba(43,47,64,0.70)] after:to-[rgba(43,47,64,0.42)]",
        )}
      />
    </Card>
  );
};

export default TangleCloudCard;
