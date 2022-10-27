import { FC } from 'react';

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className='min-w-full min-h-full'>
      {children}
    </div>
  );
};
