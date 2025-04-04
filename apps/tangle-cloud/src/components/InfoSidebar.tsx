import { FC, PropsWithChildren } from 'react';

const InfoSidebar: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="space-y-2 border-r border-mono-160 dark:border-mono-160 h-full max-w-[380px]">
      {children}
    </div>
  );
};

export default InfoSidebar;
