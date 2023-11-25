import { PropsOf } from '../../types';

export interface ChainsRingProps extends PropsOf<'div'> {
  circleContent?: React.ReactNode;
  additionalSvgContent?: React.ReactNode;
  chainItems: Array<ChainItem | undefined>;
}

export type ChainItem = {
  typedChainId: number;
  onClick?: () => void;
  isActive?: boolean;
};
