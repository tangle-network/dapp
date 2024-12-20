import { TokenIcon } from '@webb-tools/icons';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import { LstIconSize } from './types';

export type LstIconProps = {
  lsProtocolId: LsProtocolId;
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

const LstIcon: FC<LstIconProps> = ({
  iconUrl,
  lsProtocolId,
  size = LstIconSize.MD,
}) => {
  const lsProtocol = getLsProtocolDef(lsProtocolId);

  return iconUrl === undefined ? (
    <TokenIcon
      size="md"
      name={lsProtocol.token}
      className={getTailwindSize(size)}
    />
  ) : (
    <img
      className={twMerge(
        'rounded-full bg-mono-40 dark:bg-mono-160 object-cover object-center',
        getTailwindSize(size),
      )}
      src={iconUrl}
      alt={`${lsProtocol.name} icon`}
      width={size}
      height={size}
    />
  );
};

export default LstIcon;
