import { AccordionSingleProps } from '@radix-ui/react-accordion';
import { IconBase } from '@webb-tools/icons/types';
import { TitleWithInfoProps } from '../TitleWithInfo/types';

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
  value?: number | React.ReactNode;

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
   * The override title
   * @default 'Fees'
   */
  title?: string;

  /**
   * The override className for the title
   */
  titleClassName?: string;

  /**
   * The override className for the title of each fee item
   */
  itemTitleClassName?: string;

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
   * The component to display info of total fees
   */
  totalFeeCmp?: React.ReactNode;

  /**
   * Indicates if the total fee is loading.
   */
  isTotalLoading?: boolean;

  /**
   * Fee fee items to display.
   */
  items?: Array<FeeItem>;
};
