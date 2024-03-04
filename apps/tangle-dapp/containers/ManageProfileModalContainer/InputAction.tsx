import { IconBase, IconSize } from '@webb-tools/icons/types';
import { IconWithTooltip } from '@webb-tools/webb-ui-components';
import { FC, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export type InputActionProps = {
  Icon: (props: IconBase) => ReactElement;
  tooltip?: string;
  iconSize?: IconSize;
  onClick?: () => void;
};

const InputAction: FC<InputActionProps> = ({
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
        onClick !== undefined && 'cursor-pointer'
      )}
    />
  );

  return tooltip === undefined ? (
    icon
  ) : (
    <IconWithTooltip content={<>{tooltip}</>} icon={icon} />
  );
};

export default InputAction;
