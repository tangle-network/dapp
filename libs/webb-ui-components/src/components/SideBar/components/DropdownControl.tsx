import React from 'react';
import { ChevronDown, ChevronUp } from '@webb-tools/icons';

// Types
type DropdownControlProps = {
  isDropdownOpen: boolean;
};

// Component
export const DropdownControl: React.FC<DropdownControlProps> = ({
  isDropdownOpen,
}) => {
  return <div>{isDropdownOpen ? <ChevronDown /> : <ChevronUp />}</div>;
};
