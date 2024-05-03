import { FC, PropsWithChildren } from 'react';

import RestakeProvider from '../../context/RestakeContext';

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <RestakeProvider>{children}</RestakeProvider>;
};

export default RestakeLayout;
