import { OperatorBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import BlueprintLogo from './BlueprintLogo';

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
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-mono-100 dark:border-mono-140 cursor-pointer h-[150px] bg-mono-120 dark:bg-mono-170',
        isSelected && 'border-green-50 dark:border-green-50 dark:bg-mono-160',
      )}
    >
      <BlueprintLogo
        name={blueprint.blueprint.metadata.name}
        url={blueprint.blueprint.metadata.logo ?? ''}
        size="lg"
      />

      {blueprint.blueprint.metadata.name}
    </div>
  );
};

export default BlueprintGridItem;
