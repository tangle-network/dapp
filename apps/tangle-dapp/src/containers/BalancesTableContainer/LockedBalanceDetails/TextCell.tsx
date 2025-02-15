import { StatusIndicator } from '@tangle-network/icons';
import { StatusVariant } from '@tangle-network/icons/StatusIndicator/types';
import {
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { FC, ReactNode } from 'react';

const TextCell: FC<{
  text: string | null;
  status?: ReactNode;
  statusVariant?: StatusVariant;
}> = ({ text, status, statusVariant = 'info' }) => {
  return (
    <div className="flex flex-row p-3 gap-2">
      {text !== null ? (
        <Typography variant="body1" fw="semibold">
          {text}
        </Typography>
      ) : (
        <SkeletonLoader size="md" />
      )}

      {status !== undefined && (
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <StatusIndicator size={12} variant={statusVariant} />
          </TooltipTrigger>

          <TooltipBody>{status}</TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default TextCell;
