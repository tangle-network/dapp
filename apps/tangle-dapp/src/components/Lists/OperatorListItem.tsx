import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import {
  Avatar,
  KeyValueWithButton,
  shortenString,
  toSubstrateAddress,
} from '@tangle-network/ui-components';
import { FC, useMemo } from 'react';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import LogoListItem from './LogoListItem';

type Props = {
  accountAddress: SubstrateAddress;
  identity?: string;
  rightUpperText?: string | React.ReactNode;
  rightBottomText?: string;
};

const OperatorListItem: FC<Props> = ({
  accountAddress,
  identity,
  rightUpperText,
  rightBottomText,
}) => {
  const ss58Prefix = useNetworkStore((store) => store.network.ss58Prefix);

  const tangleFormattedAddress = useMemo(() => {
    return toSubstrateAddress(accountAddress, ss58Prefix);
  }, [accountAddress, ss58Prefix]);

  const shortAccountAddress = shortenString(tangleFormattedAddress);
  const leftUpperContent = identity ?? shortAccountAddress;

  return (
    <LogoListItem
      logo={
        <Avatar size="lg" theme="substrate" value={tangleFormattedAddress} />
      }
      leftUpperContent={leftUpperContent}
      leftBottomContent={
        <KeyValueWithButton
          size="sm"
          keyValue={tangleFormattedAddress}
          valueFontWeight="normal"
          valueVariant="body1"
        />
      }
      rightUpperText={rightUpperText}
      rightBottomText={rightBottomText}
    />
  );
};

export default OperatorListItem;
