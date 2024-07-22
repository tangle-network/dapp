import { SettingsFillIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import DropdownChevronIcon from './DropdownChevronIcon';

const SelectValidatorsButton: FC = () => {
  return (
    <div className="group flex gap-1 justify-center items-center cursor-pointer">
      <Typography
        variant="body1"
        fw="bold"
        className="flex gap-1 items-center dark:text-mono-80 group-hover:dark:text-mono-0"
      >
        <SettingsFillIcon className="dark:fill-mono-80 group-hover:dark:fill-mono-0" />{' '}
        Validators
      </Typography>

      <DropdownChevronIcon />
    </div>
  );
};

export default SelectValidatorsButton;
