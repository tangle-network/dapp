import { isEthereumAddress } from '@polkadot/util-crypto';
import {
  CopyWithTooltip,
  ExternalLinkIcon,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { AuthorizeTxProps } from './types';

const AuthorizeTx: FC<AuthorizeTxProps> = ({
  contractFunc,
  contractLink,
  nominatorAddress,
}) => {
  const isEvmWallet = isEthereumAddress(nominatorAddress);

  return (
    <div className="grid grid-cols-2 gap-9">
      <div className="flex flex-col gap-9">
        {/* Contract */}
        {isEvmWallet && (
          <InputField.Root>
            {
              <InputField.Input
                title="Contract"
                isAddressType={false}
                value={contractFunc}
                type="text"
                readOnly
              />
            }

            <InputField.Slot>
              <ExternalLinkIcon href={contractLink} size="lg" />
            </InputField.Slot>
          </InputField.Root>
        )}

        {/* Account */}
        <InputField.Root>
          <InputField.Input
            title="Account"
            isAddressType={true}
            value={nominatorAddress}
            type="text"
            readOnly
          />

          <InputField.Slot>
            <CopyWithTooltip
              textToCopy={nominatorAddress}
              isButton={false}
              iconSize="lg"
              className="text-mono-160 dark:text-mono-80 cursor-pointer"
            />
          </InputField.Slot>
        </InputField.Root>
      </div>

      <div className="flex flex-col gap-9">
        {isEvmWallet && (
          <Typography variant="body1" fw="normal">
            StakingInterface.sol is a precompile contract used for bonding
            tokens and nominating validators.
          </Typography>
        )}

        <Typography variant="body1" fw="normal">
          The sending account that will be used to send this transaction. Any
          applicable fees will be paid by this account.
        </Typography>
      </div>
    </div>
  );
};

export default AuthorizeTx;
