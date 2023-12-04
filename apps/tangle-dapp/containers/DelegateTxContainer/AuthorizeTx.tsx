import { ExternalLinkLine } from '@webb-tools/icons/ExternalLinkLine';
import {
  CopyWithTooltip,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { AuthorizeTxProps } from './types';

const AuthorizeTx: FC<AuthorizeTxProps> = ({
  contractFunc,
  contractLink,
  nominatorAddress,
  amountToBond,
}) => {
  return (
    <div className="grid grid-cols-2 gap-9">
      <div className="flex flex-col gap-9">
        {/* Contract */}
        <InputField.Root>
          <InputField.Input
            title="Contract"
            isAddressType={false}
            value={contractFunc}
            type="text"
            readOnly
          />

          <InputField.Slot>
            <a href={contractLink} target="_blank" rel="noopener noreferrer">
              <ExternalLinkLine size="lg" />
            </a>
          </InputField.Slot>
        </InputField.Root>

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

        {/* Amount */}
        <InputField.Root>
          <InputField.Input
            title="Amount"
            isAddressType={false}
            value={amountToBond.toString() + ' tTNT'}
            type="text"
            readOnly
          />
        </InputField.Root>
      </div>

      <div className="flex flex-col gap-5">
        <Typography variant="body1" fw="normal">
          The details of the transaction including the type, the description as
          well as any parameters and fee estimations for the specific type of
          call.
        </Typography>

        <Typography variant="body1" fw="normal">
          The sending account that will be used to send this transaction. ANy
          applicable fees will be paid by this account.
        </Typography>

        <Typography variant="body1" fw="normal">
          The call hash as calculated for this transaction.
        </Typography>

        <Typography variant="body1" fw="normal">
          Adding tip to the transaction could allow for higher priority,
          especially when the chain is busy.
        </Typography>
      </div>
    </div>
  );
};

export default AuthorizeTx;
