'use client';

import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { useState, type ComponentProps, type PropsWithChildren } from 'react';
import useBreakpointValue from '../../hooks/useBreakpointValue';
import { Typography } from '../../typography/Typography';
import { Tooltip, TooltipBody } from '../Tooltip';
import type { SideBarItemProps } from './types';

function WithInfo({
  children,
  info,
}: PropsWithChildren<Pick<SideBarItemProps, 'info'>>) {
  // Manually manage tooltip state to avoid tooltip closing when
  // the child component is clicked.
  const [isOpen, setIsOpen] = useState(false);

  const tooltipBodyProps = useBreakpointValue(
    'sm',
    {
      side: 'right',
      sideOffset: 24,
    } as Partial<ComponentProps<typeof TooltipBody>>,
    {} as Partial<ComponentProps<typeof TooltipBody>>,
  );

  if (!info) return children;

  return (
    <Tooltip isOpen={isOpen}>
      <TooltipTrigger
        asChild
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </TooltipTrigger>
      <TooltipBody {...tooltipBodyProps} isDisablePortal>
        {typeof info === 'string' ? (
          <Typography variant={'body1'} className="break-normal">
            {info}
          </Typography>
        ) : (
          info
        )}
      </TooltipBody>
    </Tooltip>
  );
}

export default WithInfo;
