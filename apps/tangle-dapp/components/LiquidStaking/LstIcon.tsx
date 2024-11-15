import { TokenIcon } from '@webb-tools/icons';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';

export enum LstIconSize {
  MD = 30,
  LG = 38,
}

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
      return 'w-[38px] h-[38px]';
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
    <Image
      className={twMerge(
        'rounded-full bg-mono-40 dark:bg-mono-160',
        getTailwindSize(size),
      )}
      src={iconUrl}
      objectFit="cover"
      alt={`${lsProtocol.name} icon`}
      width={size}
      height={size}
    />
  );
};

export default LstIcon;
