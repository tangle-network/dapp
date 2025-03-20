import type { SubstrateAddress } from '../../types/address';
import type { TypographyProps } from '../../typography/types';
import type { AvatarProps } from '../Avatar';

export type ValidatorIdentityProps = {
  address: SubstrateAddress;
  identityName?: string | null;
  accountExplorerUrl?: string | null;
  displayCharacterCount?: number;
  avatarSize?: AvatarProps['size'];
  textVariant?: TypographyProps['variant'];
  showAddressInTooltip?: boolean;
};
