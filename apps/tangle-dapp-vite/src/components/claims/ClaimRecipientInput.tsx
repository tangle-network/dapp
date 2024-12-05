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
          className="p-4 rounded-full bg-mono-0 dark:bg-mono-180 text-mono-140 dark:text-mono-40 max-w-none border border-mono-80 dark:border-mono-120"
          isDisabled={isDisabled}
        >
          <TextField.Slot>
            {/**
             * Value should be always defined, otherwise the avatar component
             * will throw an error. Ensure that no empty string is passed to the
             * avatar component by defaulting to `0x00` if the value is an empty
             * string.
             */}
            <Avatar
              theme={isEthereumAddress(value) ? 'ethereum' : 'substrate'}
              value={value === '' ? '0x00' : value}
            />
          </TextField.Slot>

          <TextField.Input
            className="font-light !text-sm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </TextField.Root>
      </div>
    </div>
  );
};

export default ClaimRecipientInput;
