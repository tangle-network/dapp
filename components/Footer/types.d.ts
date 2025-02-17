import { TANGLE_AVAILABLE_SOCIALS, bottomLinks } from '../../constants';
import { PropsOf } from '../../types';
export interface FooterProps extends PropsOf<'footer'> {
    isMinimal?: boolean;
    logoType?: 'webb' | 'tangle';
    socialsLinkOverrides?: Partial<Record<(typeof TANGLE_AVAILABLE_SOCIALS)[number], string>>;
    bottomLinkOverrides?: Partial<Record<(typeof bottomLinks)[number]['name'], string>>;
}
