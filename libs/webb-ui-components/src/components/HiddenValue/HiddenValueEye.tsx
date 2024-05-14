import { EyeClosedLine, EyeLineIcon } from '@webb-tools/icons';
import { type FC } from 'react';
import { IconButton } from '../buttons/index.js';
import { useHiddenValue } from '../../hooks/index.js';

export const HiddenValueEye: FC = () => {
  const [isHiddenValue, setIsHiddenValue] = useHiddenValue();

  return (
    <IconButton onClick={() => setIsHiddenValue((prev) => !prev)}>
      {isHiddenValue ? <EyeClosedLine /> : <EyeLineIcon />}
    </IconButton>
  );
};
