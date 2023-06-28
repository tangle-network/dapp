import React, { useState } from 'react';
import { DropdownControl } from './DropdownControl';
import { SubItem, SubItemProps } from './SubItem';
import { ExternalLinkLine } from '@webb-tools/icons';
import { pushToInternalLink, pushToExternalLink } from '../utils';
import { IconBase } from '@webb-tools/icons/types';

// Types
export type ItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  subItems: SubItemProps[];
  isSidebarOpen?: boolean;
};

// Component
export const Item: React.FC<ItemProps> = ({
  name,
  isInternal,
  href,
  Icon,
  subItems,
  isSidebarOpen,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const pushToLinkAndToggleDropdown = () => {
    if (isInternal && href) {
      pushToInternalLink(href);
    } else {
      pushToExternalLink(href);
    }

    if (subItems.length > 0) {
      toggleDropdown();
    }
  };

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={pushToLinkAndToggleDropdown}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {typeof Icon === 'string' ? (
              <img src={Icon} alt="Logo" />
            ) : (
              <Icon width={24} height={24} />
            )}

            {isSidebarOpen && <div>{name}</div>}
          </div>
        </div>

        {isSidebarOpen && (
          <div>
            {!isInternal && href && subItems.length <= 0 ? (
              <ExternalLinkLine />
            ) : isInternal && href && subItems.length > 0 ? (
              <DropdownControl isDropdownOpen={isDropdownOpen} />
            ) : null}
          </div>
        )}
      </div>

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
