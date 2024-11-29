import { BN } from '@polkadot/util';
import Optional from '@webb-tools/tangle-shared-ui/utils/Optional';

import { RestakingProfileType } from '../../types';
import { RestakingService } from '../../types';

export type ManageProfileModalContainerProps = {
  hasExistingProfile: boolean | null;
  profileTypeOpt: Optional<RestakingProfileType> | null;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RestakingAllocationMap = Partial<Record<RestakingService, BN>>;
