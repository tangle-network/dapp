import { ExternalLinkLine } from '@webb-tools/icons';
import React, { useMemo } from 'react';
import { pushToInternalLink, pushToExternalLink } from '../utils';
import { Typography } from '../../../typography/Typography';
import { twMerge } from 'tailwind-merge';

export type SubItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
};

export type ExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};

export const SubItem: React.FC<SubItemProps & ExtraSubItemProps> = ({
  name,
  isInternal,
  href,
  isActive,
  setItemIsActive,
  setSubItemIsActive,
}) => {
  const pushToLinkAndSetIsActive = () => {
    if (setItemIsActive && setSubItemIsActive && isInternal) {
      setItemIsActive();
      setSubItemIsActive();
    }

    if (isInternal && href) {
      pushToInternalLink(href);
    } else if (!isInternal && href) {
      pushToExternalLink(href);
    }
  };

  return (
    <li className="list-disc select-none" onClick={pushToLinkAndSetIsActive}>
      <div className="flex items-center justify-between cursor-pointer">
        <div className="flex gap-1">
          <Typography
            variant="body1"
            className={twMerge(
              'text-mono-100 dark:text-mono-60',
              isActive && isInternal ? 'text-mono-200 dark:text-mono-0' : ''
            )}
          >
            {name}
          </Typography>
        </div>

        {!isInternal && href && <ExternalLinkLine />}
      </div>
    </li>
  );
};
