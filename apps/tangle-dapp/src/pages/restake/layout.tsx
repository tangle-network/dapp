import { FC } from 'react';
import { Outlet } from 'react-router';
import Providers from './providers';

const RestakeLayout: FC = () => {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
};

export default RestakeLayout;
