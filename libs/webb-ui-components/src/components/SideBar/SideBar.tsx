import React, { useState } from 'react';
import { SidebarControl } from './components/SidebarControl';
import { Item, ItemProps } from './components/Item';
import { IconBase } from '@webb-tools/icons/types';
import { LogoProps } from '../Logo/types';

// Types
type SidebarProps = {
  Logo: React.FC<LogoProps>;
  items: ItemProps[];
};

// Component
export const SideBar: React.FC<SidebarProps> = ({ Logo, items }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const contentContainerClassName = isSidebarOpen
    ? 'w-[300px] border-2'
    : 'w-[100px] border-2';

  return (
    <div className="flex gap-2">
      {/* Content */}
      <div className={contentContainerClassName}>
        {/* Logo */}
        <div>
          {typeof Logo === 'string' ? (
            <img src={Logo} alt="Logo" />
          ) : (
            <Logo size="md" />
          )}
        </div>

        {/* Items */}
        <div>
          {items.map((itemProps) => (
            <Item {...itemProps} isSidebarOpen={isSidebarOpen} />
          ))}
        </div>
      </div>

      {/*Sidebar  Control */}
      <SidebarControl
        isSidebarOpen={isSidebarOpen}
        toggleSideBar={toggleSideBar}
      />
    </div>
  );
};
