'use client';

import { useState, type ComponentProps, type PropsWithChildren } from 'react';
import useBreakpointValue from '../../hooks/useBreakpointValue';
import { Typography } from '../../typography/Typography';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import type { SideBarItemProps } from './types';

function WithInfo({
  children,
  info,
}: PropsWithChildren<Pick<SideBarItemProps, 'info'>>) {
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
    <Tooltip isOpen={isOpen} onChange={setIsOpen}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipBody {...tooltipBodyProps} isDisablePortal>
        {typeof info === 'string' ? (
          <Typography variant={'body1'} className="break-normal !text-inherit">
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
