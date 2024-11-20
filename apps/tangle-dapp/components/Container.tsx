import { FC, PropsWithChildren } from 'react';

const DarkContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="bg-mono-0 dark:bg-mono-200 p-6 rounded-xl border border-mono-60 dark:border-mono-170">
      {children}
    </div>
  );
};

export default DarkContainer;
