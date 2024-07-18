import { FC, PropsWithChildren } from 'react';

import Providers from './providers';

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Providers>
      <div className="grid grid-cols-1 gap-6 justify-evenly">{children}</div>
    </Providers>
  );
};

export default RestakeLayout;
