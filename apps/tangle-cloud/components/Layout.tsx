import Sidebar from './Sidebar';
import { FC, PropsWithChildren } from 'react';

type Props = {
  isSidebarInitiallyExpanded?: boolean;
};

const Layout: FC<PropsWithChildren<Props>> = ({
  children,
  isSidebarInitiallyExpanded,
}) => {
  return (
    <div className={`flex min-h-screen bg-body body-bg`}>
      <Sidebar isExpandedAtDefault={isSidebarInitiallyExpanded} />

      <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
        {children}
      </main>
    </div>
  );
};

export default Layout;
