import { FC } from 'react';

import { AnySubstrateAddress } from '../../types/utils';
import HexagonAvatar from './HexagonAvatar';

export type HexagonAvatarListProps = {
  addresses: AnySubstrateAddress[];
};

const HexagonAvatarList: FC<HexagonAvatarListProps> = ({ addresses }) => {
  return (
    <div className="flex -space-x-2">
      {addresses.map((address) => (
        <HexagonAvatar key={address} address={address} />
      ))}
    </div>
  );
};

export default HexagonAvatarList;
