import { PropsOf } from '../../types/index.js';

export interface ChainsRingProps extends PropsOf<'div'> {
  circleContent?: React.ReactNode;
  additionalSvgContent?: React.ReactNode;
  chainItems: Array<ChainRingItemType | undefined>;
  isInNextApp?: boolean;
}

export type ChainRingItemType = {
  typedChainId?: number;
  onClick?: () => void;
  isActive?: boolean;
};
