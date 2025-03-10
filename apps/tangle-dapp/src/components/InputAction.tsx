import { IconBase, IconSize } from '@tangle-network/icons/types';
import { IconWithTooltip } from '@tangle-network/ui-components';
import { FC, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  Icon: (props: IconBase) => ReactElement;
  tooltip?: string;
  iconSize?: IconSize;
  onClick?: () => void;
};

const InputAction: FC<Props> = ({
  tooltip,
  iconSize = 'lg',
  Icon,
  onClick,
}) => {
  const icon = (
    <Icon
      onClick={onClick}
      size={iconSize}
      className={twMerge(
        'dark:fill-mono-0',
        onClick !== undefined && 'cursor-pointer',
      )}
    />
  );

  return tooltip === undefined ? (
    icon
  ) : (
    <IconWithTooltip
      overrideTooltipBodyProps={{ className: 'max-w-[200px]' }}
      content={tooltip}
      icon={icon}
    />
  );
};

export default InputAction;
