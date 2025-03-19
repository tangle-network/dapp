import { TokenIcon } from '@tangle-network/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { LstIconSize } from './types';

type Props = {
  iconUrl?: string;
  size?: LstIconSize;
};

const getTailwindSize = (size: LstIconSize) => {
  switch (size) {
    case LstIconSize.MD:
      return 'w-[30px] h-[30px]';
    case LstIconSize.LG:
      return 'w-[40px] h-[40px]';
  }
};

const LstIcon: FC<Props> = ({ iconUrl, size = LstIconSize.MD }) => {
  return iconUrl === undefined ? (
    <TokenIcon size="md" name="tnt" className={getTailwindSize(size)} />
  ) : (
    <img
      className={twMerge(
        'rounded-full bg-mono-40 dark:bg-mono-160 object-cover object-center',
        getTailwindSize(size),
      )}
      src={iconUrl}
      alt="Liquid staking pool icon"
      width={size}
      height={size}
    />
  );
};

export default LstIcon;
