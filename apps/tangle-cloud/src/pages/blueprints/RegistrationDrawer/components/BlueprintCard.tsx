import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Text } from '../../../../components/sandbox/SandboxUi';
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
        'flex items-center gap-3 p-4 border border-border rounded-lg bg-card/70',
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
        <Text
          variant={compact ? 'body2' : 'body1'}
          fw="bold"
          className="truncate"
        >
          {blueprint.name}
        </Text>

        <Text variant="body3" className="text-muted-foreground truncate">
          {blueprint.author}
        </Text>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default BlueprintCard;
