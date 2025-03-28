import { OperatorBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { FC } from 'react';

type Props = {
  blueprint: OperatorBlueprint;
  onClick: () => void;
};

const BlueprintGridItem: FC<Props> = ({ onClick, blueprint }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl border border-mono-100 dark:border-mono-140"
    >
      {blueprint.blueprint.metadata.name}
    </div>
  );
};

export default BlueprintGridItem;
