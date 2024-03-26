import { BN } from '@polkadot/util';

import { RestakingProfileType } from '../../types';
import { RestakingService } from '../../types';
import Optional from '../../utils/Optional';

export type ManageProfileModalContainerProps = {
  hasExistingProfile: boolean | null;
  profileTypeOpt: Optional<RestakingProfileType> | null;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RestakingAllocationMap = Partial<Record<RestakingService, BN>>;
