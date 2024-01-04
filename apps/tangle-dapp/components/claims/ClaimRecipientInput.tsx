import { isEthereumAddress } from '@polkadot/util-crypto';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { TextField } from '@webb-tools/webb-ui-components/components/TextField';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';

type Props = {
  recipient: string;
  setRecipient: (recipient: string) => void;
  error: string;
  isDisabled?: boolean;
};

const ClaimRecipientInput: FC<Props> = ({
  error,
  recipient: value,
  setRecipient: setValue,
  isDisabled,
}) => {
  return (
    <div className="space-y-4">
      <Typography variant="body1" fw="bold">
        Airdrop Recipient (EVM or Substrate)
      </Typography>

      <div>
        <TextField.Root
          error={error}
          className="p-4 rounded-full bg-mono-0 dark:bg-mono-180 text-mono-140 dark:text-mono-40 max-w-none"
          isDisabled={isDisabled}
        >
          <TextField.Slot>
            <Avatar
              theme={isEthereumAddress(value) ? 'ethereum' : 'substrate'}
              value={value || '0x00'}
            />
          </TextField.Slot>
          <TextField.Input
            className="body1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </TextField.Root>
      </div>
    </div>
  );
};

export default ClaimRecipientInput;
