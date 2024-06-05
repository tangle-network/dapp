import { WEBB_AVAILABLE_SOCIALS, bottomLinks } from '../../constants';
import { PropsOf } from '../../types';

export interface FooterProps extends PropsOf<'footer'> {
  /**
   * If `true`, the footer will use `next/link` instead of `react-router-dom` for the links.
   */
  isNext?: boolean;
  isMinimal?: boolean;
  logoType?: 'webb' | 'tangle';

  socialsLinkOverrides?: Partial<
    Record<(typeof WEBB_AVAILABLE_SOCIALS)[number], string>
  >;

  bottomLinkOverrides?: Partial<
    Record<(typeof bottomLinks)[number]['name'], string>
  >;
}
