import { StatusIndicator } from '@webb-tools/icons';
import {
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

const TextCell: FC<{
  text: string | null;
  status?: ReactNode;
}> = ({ text, status }) => {
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
            <StatusIndicator size={12} variant="info" />
          </TooltipTrigger>

          <TooltipBody className="break-normal max-w-[250px] text-center">
            {status}
          </TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default TextCell;
