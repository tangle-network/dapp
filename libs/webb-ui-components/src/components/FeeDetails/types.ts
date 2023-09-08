import { AccordionSingleProps } from '@radix-ui/react-accordion';
import { TitleWithInfoProps } from '../TitleWithInfo/types';
import { IconBase } from '@webb-tools/icons/types';

/**
 * The fee item to display in the FeeDetails component.
 */
export type FeeItem = {
  /**
   * The fee name
   */
  name: string;

  /**
   * Icon to display before the fee name.
   */
  Icon?: React.ReactElement<IconBase>;

  /**
   * The tooltip info.
   */
  info?: TitleWithInfoProps['info'];

  /**
   * The formated fee value.
   */
  value?: number;

  /**
   * The fee token symbol.
   */
  tokenSymbol?: string;

  /**
   * The fee value in USD.
   */
  valueInUsd?: number;

  /**
   * Indicates if the fee is loading.
   */
  isLoading?: boolean;
};

/**
 * The props for the FeeDetails component.
 */
export type FeeDetailsProps = Omit<AccordionSingleProps, 'type'> & {
  /**
   * The fee tooltip info.
   */
  info?: TitleWithInfoProps['info'];

  /**
   * The total fee value to display.
   */
  totalFee?: number;

  /**
   * The total fee token symbol to display and render the token icon.
   */
  totalFeeToken?: string;

  /**
   * Indicates if the total fee is loading.
   */
  isTotalLoading?: boolean;

  /**
   * Fee fee items to display.
   */
  items?: Array<FeeItem>;
};
