import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsToken } from '../../../constants/liquidStaking/types';
import DropdownChevronIcon from '../../DropdownChevronIcon';

type LsTokenChipProps = {
  token?: LsToken;
  isDerivativeVariant: boolean;
  onClick?: () => void;
};

const LsTokenChip: FC<LsTokenChipProps> = ({
  token,
  isDerivativeVariant,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center px-4 py-2 rounded-full',
        'border border-mono-100 dark:border-mono-140',
        'bg-mono-40 dark:bg-mono-170',
        onClick !== undefined &&
          'cursor-pointer hover:bg-mono-20 hover:dark:bg-mono-160',
      )}
    >
      {token && (
        <LsTokenIcon hasRainbowBorder={isDerivativeVariant} name={token} />
      )}

      <Typography variant="h5" fw="bold">
        {isDerivativeVariant && LS_DERIVATIVE_TOKEN_PREFIX}
        {token}
      </Typography>

      {onClick !== undefined && <DropdownChevronIcon />}
    </div>
  );
};

export default LsTokenChip;
