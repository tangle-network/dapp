import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ProposalsBadgeGroupProps } from './types';
import ProposalBadge from '@webb-tools/icons/ProposalBadge/ProposalBadge';
import { Tooltip, TooltipTrigger, TooltipBody } from '../Tooltip';

export const ProposalsBadgeGroup = forwardRef<
  HTMLDivElement,
  ProposalsBadgeGroupProps
>(({ proposals, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge('flex items-center -space-x-2', className)}
      {...props}
    >
      {proposals.map((proposal, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger>
            <ProposalBadge variant={proposal} />
          </TooltipTrigger>
          <TooltipBody className="max-w-[185px] w-auto">
            <span>{proposal}</span>
          </TooltipBody>
        </Tooltip>
      ))}
    </div>
  );
});
