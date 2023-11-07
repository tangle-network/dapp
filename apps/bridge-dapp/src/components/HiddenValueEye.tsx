import { type FC } from 'react';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import EyeLine from '@webb-tools/icons/EyeLine';

import useHiddenValue from '../hooks/useHiddenValue';

const HiddenValueEye: FC = () => {
  const [, setIsHiddenValue] = useHiddenValue();

  return (
    <IconButton onClick={() => setIsHiddenValue((prev) => !prev)}>
      <EyeLine />
    </IconButton>
  );
};

export default HiddenValueEye;
