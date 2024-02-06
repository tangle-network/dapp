import { IconBase } from '@webb-tools/icons/types';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, JSX } from 'react';

const BalanceAction: FC<{
  tooltip: string;
  onClick: () => void;
  Icon: (props: IconBase) => JSX.Element;
}> = ({ tooltip, Icon, onClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton onClick={onClick}>
          <Icon size="md" />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

export default BalanceAction;
