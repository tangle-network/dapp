import { FC } from '../../../../../node_modules/react';
import { Chip } from '../Chip';
import { PropsOf } from '../../types';
type SocialType = 'discord' | 'github' | 'twitter' | 'website' | 'email';
type SocialChipProps = PropsOf<typeof Chip> & {
    href: string;
    type: SocialType;
};
declare const SocialChip: FC<SocialChipProps>;
export default SocialChip;
