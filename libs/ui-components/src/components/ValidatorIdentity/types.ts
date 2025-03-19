import type { SubstrateAddress } from '../../types/address';
import type { TypographyProps } from '../../typography/types';
import type { AvatarProps } from '../Avatar';

export type ValidatorIdentityProps = {
  address: SubstrateAddress;
  displayCharacterCount?: number;
  identityName?: string;
  accountExplorerUrl?: string;
  avatarSize?: AvatarProps['size'];
  textVariant?: TypographyProps['variant'];
  showAddressInTooltip?: boolean;
};
