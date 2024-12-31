import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import {
  Avatar,
  EMPTY_VALUE_PLACEHOLDER,
  KeyValueWithButton,
  shortenString,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import LogoListItem from './LogoListItem';

type Props = {
  accountAddress: SubstrateAddress;
  identity?: string;
  rightUpperText?: string;
  rightBottomText?: string;
};

const OperatorListItem: FC<Props> = ({
  accountAddress,
  identity,
  rightUpperText,
  rightBottomText,
}) => {
  const shortAccountAddress = shortenString(accountAddress);
  const leftUpperContent = identity ?? shortAccountAddress;

  return (
    <LogoListItem
      logo={<Avatar size="lg" theme="substrate" value={accountAddress} />}
      leftUpperContent={leftUpperContent}
      leftBottomText={
        <KeyValueWithButton size="sm" keyValue={accountAddress} />
      }
      rightUpperText={rightUpperText ?? EMPTY_VALUE_PLACEHOLDER}
      rightBottomText={rightBottomText}
    />
  );
};

export default OperatorListItem;
