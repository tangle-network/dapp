import { type FC } from 'react';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import EyeLineIcon from '@webb-tools/icons/EyeLineIcon';

import useHiddenValue from '../hooks/useHiddenValue';

const HiddenValueEye: FC = () => {
  const [, setIsHiddenValue] = useHiddenValue();

  return (
    <IconButton onClick={() => setIsHiddenValue((prev) => !prev)}>
      <EyeLineIcon />
    </IconButton>
  );
};

export default HiddenValueEye;
