import { ExternalLinkLine } from '@webb-tools/icons';
import React, { useState } from 'react';
import { pushToInternalLink, pushToExternalLink } from '../utils';

// Types
export type SubItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
};

// Component
export const SubItem: React.FC<SubItemProps> = ({ name, isInternal, href }) => {
  return (
    <div
      className="flex items-center justify-between cursor-pointer"
      onClick={
        isInternal
          ? () => pushToInternalLink(href)
          : () => pushToExternalLink(href)
      }
    >
      <div className="flex gap-1">
        <div>{name}</div>
      </div>

      {!isInternal && href && <ExternalLinkLine />}
    </div>
  );
};
