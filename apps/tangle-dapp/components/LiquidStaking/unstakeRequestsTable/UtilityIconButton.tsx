import { IconBase } from '@webb-tools/icons/types';
import { IconButton } from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

export type UtilityIconButtonProps = {
  tooltip: string;
  Icon: (props: IconBase) => ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
};

const UtilityIconButton: FC<UtilityIconButtonProps> = ({
  tooltip,
  Icon,
  onClick,
  isDisabled = false,
}) => {
  // TODO: Add styling for disabled state.
  return (
    <IconButton
      className="dark:bg-blue-120 hover:bg-blue-10"
      onClick={onClick}
      tooltip={tooltip}
    >
      <Icon className="fill-blue-80 dark:fill-blue-40" size="md" />
    </IconButton>
  );
};

export default UtilityIconButton;
