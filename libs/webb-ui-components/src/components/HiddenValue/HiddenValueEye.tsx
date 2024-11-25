import { EyeClosedLine, EyeLineIcon } from '@webb-tools/icons';
import { type FC } from 'react';
import { IconButton } from '../buttons';
import { useHiddenValue } from '../../hooks';

export const HiddenValueEye: FC<{ className?: string }> = ({ className }) => {
  const [isHiddenValue, setIsHiddenValue] = useHiddenValue();

  return (
    <IconButton
      className={className}
      onClick={() => setIsHiddenValue((prev) => !prev)}
    >
      {isHiddenValue ? <EyeClosedLine /> : <EyeLineIcon />}
    </IconButton>
  );
};
