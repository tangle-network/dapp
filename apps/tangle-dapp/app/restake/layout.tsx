import { FC, PropsWithChildren } from 'react';

import Providers from './providers';

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Providers>{children}</Providers>;
};

export default RestakeLayout;
