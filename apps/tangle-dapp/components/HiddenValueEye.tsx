import { EyeClosedLine, EyeLineIcon } from '@webb-tools/icons';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import { type FC } from 'react';

import useHiddenValue from '../hooks/useHiddenValue';

const HiddenValueEye: FC = () => {
  const [isHiddenValue, setIsHiddenValue] = useHiddenValue();

  return (
    <IconButton onClick={() => setIsHiddenValue((prev) => !prev)}>
      {isHiddenValue ? <EyeClosedLine /> : <EyeLineIcon />}
    </IconButton>
  );
};

export default HiddenValueEye;
