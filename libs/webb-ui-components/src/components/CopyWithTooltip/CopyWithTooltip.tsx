import { FileCopyLine } from '@webb-tools/icons';
import cx from 'classnames';
import { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCopyable } from '../../hooks';

import { Typography } from '../../typography/Typography';
import { Button } from '../Button';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { CopyWithTooltipProps, CopyWithTooltipUIProps } from './types';

/**
 * The `CopyWithTooltip` component
 *
 * @example
 *
 * ```jsx
 *  <CopyWithTooltip textToCopy="0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7" />
 * ```
 */
export const CopyWithTooltip: React.FC<CopyWithTooltipProps> = ({
  className,
  textToCopy,
}) => {
  const { copy, isCopied } = useCopyable();

  return (
    <CopyWithTooltipUI
      className={className}
      onClick={() => {
        copy(textToCopy);
      }}
      isCopied={isCopied}
    />
  );
};

/**********************
 * Internal component *
 **********************/

/**
 * The internal UI component to prevent re-render when the isCopied state changes
 */
const CopyWithTooltipUI: React.FC<CopyWithTooltipUIProps> = ({
  isCopied,
  onClick,
  className,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <Tooltip isOpen={isTooltipOpen}>
      <TooltipTrigger
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        className={twMerge(isCopied ? 'cursor-not-allowed' : '', className)}
        onClick={onClick}
        asChild
      >
        <Button className="p-2" variant="utility" size="sm">
          <FileCopyLine className="!fill-current" />
        </Button>
      </TooltipTrigger>
      <TooltipBody>
        <Typography className="capitalize" variant="body3">
          {isCopied ? 'Copied!' : 'Copy'}
        </Typography>
      </TooltipBody>
    </Tooltip>
  );
};
