import { Currency } from '@webb-tools/abstract-api-provider';
import { ChainListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';

export interface ChainListCardWrapperProps
  extends Omit<ChainListCardProps, 'chainType' | 'chains'>,
    Partial<Pick<ChainListCardProps, 'chainType' | 'chains'>> {
  /**
   * The fungible currency to set the active bridge when switching chain
   */
  fungibleCurrency?: Currency;
}
