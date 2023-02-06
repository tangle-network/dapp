import { ChainListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';

export interface ChainListCardWrapperProps
  extends Omit<ChainListCardProps, 'chainType' | 'chains'>,
    Partial<Pick<ChainListCardProps, 'chainType' | 'chains'>> {}
