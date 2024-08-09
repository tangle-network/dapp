import { FC, PropsWithChildren } from 'react';

import Providers from './providers';

export const dynamic = 'force-static';

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Providers>{children}</Providers>;
};

export default RestakeLayout;
