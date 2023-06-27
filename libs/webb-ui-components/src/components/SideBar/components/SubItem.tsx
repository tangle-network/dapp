import React, { useState } from 'react';

// Types
export type SubItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
};

// Component
export const SubItem: React.FC<SubItemProps> = ({ name, isInternal, href }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex gap-1">
          <div>{name}</div>
        </div>
      </div>
    </div>
  );
};
