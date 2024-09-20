'use client';

import { FileCopyLine } from '@webb-tools/icons/FileCopyLine';
import { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCopyable } from '../../hooks';
import { Typography } from '../../typography/Typography';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { Button } from '../buttons';
import { CopyWithTooltipProps, CopyWithTooltipUIProps } from './types';
import { CheckLineIcon } from '@webb-tools/icons';

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
  isButton = true,
  iconSize = 'md',
  iconClassName,
  copyLabel,
}) => {
  const { copy, isCopied } = useCopyable();

  return (
    <CopyWithTooltipUI
      className={className}
      onClick={() => {
        copy(textToCopy);
      }}
      isCopied={isCopied}
      isButton={isButton}
      iconSize={iconSize}
      iconClassName={iconClassName}
      copyLabel={copyLabel}
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
  iconClassName,
  isButton,
  iconSize,
  copyLabel = 'Copy',
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const IconTag = isCopied ? CheckLineIcon : FileCopyLine;

  const icon = (
    <IconTag
      size={iconSize}
      className={twMerge('!fill-current', iconClassName)}
    />
  );

  const handleClick = useCallback(() => {
    // Don't re-trigger the copy action if the text is already copied.
    if (isCopied) {
      return;
    }

    onClick();
  }, [isCopied, onClick]);

  return (
    <Tooltip isOpen={isTooltipOpen && !isCopied}>
      <TooltipTrigger
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        className={twMerge(
          isCopied ? 'cursor-default' : 'cursor-pointer',
          className,
        )}
        onClick={handleClick}
        asChild
      >
        {isButton ? (
          <Button className="p-2" variant="utility" size="sm">
            {icon}
          </Button>
        ) : (
          <span>{icon}</span>
        )}
      </TooltipTrigger>

      <TooltipBody>
        <Typography className="capitalize" variant="body3">
          {copyLabel}
        </Typography>
      </TooltipBody>
    </Tooltip>
  );
};
