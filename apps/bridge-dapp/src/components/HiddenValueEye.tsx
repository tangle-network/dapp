import { type FC } from 'react';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import { EyeLine, EyeClosedLine } from '@webb-tools/icons';

import useHiddenValue from '../hooks/useHiddenValue';

const HiddenValueEye: FC = () => {
  const [isHiddenValue, setIsHiddenValue] = useHiddenValue();

  return (
    <IconButton onClick={() => setIsHiddenValue((prev) => !prev)}>
      {isHiddenValue ? <EyeClosedLine /> : <EyeLine />}
    </IconButton>
  );
};

export default HiddenValueEye;
