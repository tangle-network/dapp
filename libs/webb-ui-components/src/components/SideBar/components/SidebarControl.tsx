import React from 'react';
import { ChevronLeft, ChevronRight } from '@webb-tools/icons';

// Types
type SidebarControlProps = {
  isSidebarOpen: boolean;
  toggleSideBar: () => void;
};

// Component
export const SidebarControl: React.FC<SidebarControlProps> = ({
  isSidebarOpen,
  toggleSideBar,
}) => {
  return (
    <div>
      <div
        onClick={toggleSideBar}
        className="bg-mono-0 dark:bg-mono-180 rounded-full p-1 cursor-pointer"
      >
        {isSidebarOpen ? <ChevronLeft size="lg" /> : <ChevronRight size="lg" />}
      </div>
    </div>
  );
};
