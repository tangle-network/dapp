import { PropsOf } from '../../types';

export interface FooterProps extends PropsOf<'footer'> {
  /**
   * If `true`, the footer will use `next/link` instead of `react-router-dom` for the links.
   */
  isNext?: boolean;
  isMinimal?: boolean;
}
