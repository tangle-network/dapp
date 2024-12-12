import { FC, PropsWithChildren } from 'react';

const DetailsContainer: FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex flex-col gap-2 p-3">{children}</div>;
};

export default DetailsContainer;
