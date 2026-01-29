import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type BlueprintCardProps = {
  blueprint: Blueprint;
  compact?: boolean;
  className?: string;
  action?: ReactNode;
};

const BlueprintCard: FC<BlueprintCardProps> = ({
  blueprint,
  compact = false,
  className,
  action,
}) => {
  const imageSize = compact ? 32 : 48;

  return (
    <div
      className={twMerge(
        'flex items-center gap-3 p-4 border border-mono-80 dark:border-mono-160 rounded-lg',
        className,
      )}
    >
      {blueprint.imgUrl && (
        <img
          src={blueprint.imgUrl}
          width={imageSize}
          height={imageSize}
          alt={blueprint.name}
          className="flex-shrink-0 bg-center rounded-full"
        />
      )}

      <div className="flex-1 min-w-0">
        <Typography
          variant={compact ? 'body2' : 'body1'}
          fw="bold"
          className="truncate"
        >
          {blueprint.name}
        </Typography>

        <Typography
          variant="body3"
          className="text-mono-120 dark:text-mono-100 truncate"
        >
          {blueprint.author}
        </Typography>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default BlueprintCard;
