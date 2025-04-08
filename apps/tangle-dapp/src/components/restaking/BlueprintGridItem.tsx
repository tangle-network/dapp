import { OperatorBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import BlueprintLogo from './BlueprintLogo';
import { Typography } from '@tangle-network/ui-components';

type Props = {
  isSelected: boolean;
  blueprint: OperatorBlueprint;
  onClick: () => void;
};

const BlueprintGridItem: FC<Props> = ({ onClick, isSelected, blueprint }) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        'flex flex-col items-start justify-center gap-2 px-4 py-2 rounded-xl border-2 border-mono-100 dark:border-mono-140 cursor-pointer h-[150px] bg-mono-120 dark:bg-mono-170 bg-center bg-cover bg-no-repeat bg-top-banner',
        isSelected && 'border-green-50 dark:border-green-50 dark:bg-mono-160',
      )}
    >
      <div className="flex gap-2 items-center justify-start">
        <BlueprintLogo
          name={blueprint.blueprint.metadata.name}
          url={blueprint.blueprint.metadata.logo ?? undefined}
          size="lg"
        />

        <Typography variant="body1" className="dark:text-mono-0">
          {blueprint.blueprint.metadata.name}
        </Typography>
      </div>

      <Typography variant="body2">
        {blueprint.blueprint.metadata.description}
      </Typography>

      <Typography variant="body3" className="opacity-60">
        $123.45 TVL &bull; Tangle Network
      </Typography>
    </div>
  );
};

export default BlueprintGridItem;
