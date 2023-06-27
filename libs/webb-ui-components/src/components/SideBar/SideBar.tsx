import React, { useState } from 'react';
import { SidebarControl } from './components/SidebarControl';
import { Item, ItemProps } from './components/Item';

// Types
type SidebarProps = {
  items: ItemProps[];
};

// Component
export const SideBar: React.FC<SidebarProps> = ({ items }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('');
  const [activeSubItem, setActiveSubItem] = useState('');

  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const setActiveItemHandler = (name: string) => {
    setActiveItem(name);
  };

  const setActiveSubItemHandler = (name: string) => {
    setActiveSubItem(name);
  };

  const contentContainerClassName = isSidebarOpen
    ? 'w-[300px] border-2'
    : 'w-[100px] border-2';

  return (
    <div className="flex gap-2">
      {/* Content */}
      <div className={contentContainerClassName}>
        {/* Logo */}
        <div>LOGO</div>

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
