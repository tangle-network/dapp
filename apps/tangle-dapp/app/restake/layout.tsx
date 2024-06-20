import { FC, PropsWithChildren } from 'react';

import Card from './Card';
import Providers from './providers';

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Providers>
      <Card>{children}</Card>
    </Providers>
  );
};

export default RestakeLayout;
