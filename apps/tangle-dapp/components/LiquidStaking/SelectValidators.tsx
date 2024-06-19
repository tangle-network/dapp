import { ChevronDown, SettingsFillIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import HoverButtonStyle from './HoverButtonStyle';

const SelectValidators: FC = () => {
  return (
    <HoverButtonStyle>
      <div className="flex gap-1 justify-center items-center">
        <Typography
          variant="body1"
          fw="bold"
          className="flex gap-1 items-center dark:text-mono-80"
        >
          <SettingsFillIcon /> Validators
        </Typography>

        <ChevronDown className="dark:fill-mono-120" size="lg" />
      </div>
    </HoverButtonStyle>
  );
};

export default SelectValidators;
