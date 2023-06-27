import React, { useState } from 'react';
import { DropdownControl } from './DropdownControl';
import { SubItem, SubItemProps } from './SubItem';
import { ExternalLinkLine } from '@webb-tools/icons';
import { InternalOrExternalLink } from '../../Navbar';

// Types
export type ItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
  icon: React.ReactNode;
  subItems: SubItemProps[];
  isSidebarOpen?: boolean;
};

// Component
export const Item: React.FC<ItemProps> = ({
  name,
  isInternal,
  href,
  icon,
  subItems,
  isSidebarOpen,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div>
      <InternalOrExternalLink
        url={href}
        isInternal={isInternal}
        className="flex items-center justify-between cursor-pointer"
        onClick={subItems.length > 0 ? toggleDropdown : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <div>{icon}</div>

            {isSidebarOpen && <div>{name}</div>}
          </div>
        </div>

        {isSidebarOpen && (
          <div>
            {!isInternal && subItems.length <= 0 ? (
              <ExternalLinkLine />
            ) : isInternal && subItems.length > 0 ? (
              <DropdownControl isDropdownOpen={isDropdownOpen} />
            ) : null}
          </div>
        )}
      </InternalOrExternalLink>

      {isSidebarOpen && isDropdownOpen && (
        <div className="flex flex-col gap-1">
          {subItems.map((subItemProps) => (
            <SubItem {...subItemProps} />
          ))}
        </div>
      )}
    </div>
  );
};
