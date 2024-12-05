import { FC } from 'react';
import { Outlet } from 'react-router';
import Providers from './providers';

export const dynamic = 'force-static';

const RestakeLayout: FC = () => {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
};

export default RestakeLayout;
