import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { FC } from 'react';
import BlueprintItemIcon from './BlueprintItemIcon';
import { Typography } from '@tangle-network/ui-components';

type Props = {
  blueprint: Blueprint;
};

const BlueprintListItem: FC<Props> = ({ blueprint }) => {
  return (
    <div className="flex items-center gap-2">
      <BlueprintItemIcon
        name={blueprint.name}
        url={blueprint.imgUrl ?? undefined}
      />

      <Typography variant="body1">{blueprint.name}</Typography>
    </div>
  );
};

export default BlueprintListItem;
