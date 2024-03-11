import { BN } from '@polkadot/util';

import { ServiceType } from '../../types';

export type ManageProfileModalContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RestakingAllocationMap = Record<ServiceType, BN | null>;
