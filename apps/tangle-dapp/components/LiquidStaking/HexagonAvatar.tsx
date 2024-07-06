import { FC, ReactNode } from 'react';

import { AnySubstrateAddress } from '../../types/utils';

export type HexagonAvatarProps = {
  address: AnySubstrateAddress;
};

const Hexagon: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="hexagon-clip">
          <path d="M50 5 a1,1 0 0 1 45,25 a1,1 0 0 1 0,40 a1,1 0 0 1 -45,25 a1,1 0 0 1 -45,-25 a1,1 0 0 1 0,-40 a1,1 0 0 1 45,-25z" />
        </clipPath>
      </defs>

      {children}
    </svg>
  );
};

const HexagonAvatar: FC<HexagonAvatarProps> = ({ address }) => {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-mono-2 rounded-full">
      <Hexagon>
        <div className="w-12 h-12 dark:bg-mono-50"> </div>
      </Hexagon>
    </div>
  );
};

export default HexagonAvatar;
