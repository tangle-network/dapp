import { BN } from '@polkadot/util';

import { RestakingService } from '../../types';

export type ManageProfileModalContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RestakingAllocationMap = Partial<Record<RestakingService, BN>>;
