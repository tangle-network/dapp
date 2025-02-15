import { Card, CardVariant } from '@tangle-network/ui-components';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

import TangleBigLogo from './TangleBigLogo';

const CardWithTangleLogo: FC<PropsWithChildren<{ className?: string }>> = ({
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
      {children}

      <TangleBigLogo className="absolute top-1/2 -translate-y-1/2 right-0 rounded-br-2xl" />
    </Card>
  );
};

export default CardWithTangleLogo;
