import { isEthereumAddress } from '@polkadot/util-crypto';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import type { FC } from 'react';

const AddressCell: FC<{ address: string; identityDisplay?: string }> = ({
  address,
  identityDisplay,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        value={address}
        theme={isEthereumAddress(address) ? 'ethereum' : 'substrate'}
        className="[&_*]:!cursor-copy"
        size="sm"
      />

      <KeyValueWithButton
        keyValue={identityDisplay ? identityDisplay : address}
        valueVariant="mkt-small-caps"
        size="sm"
        shortenFn={shortenString}
      />
    </div>
  );
};

export default AddressCell;
