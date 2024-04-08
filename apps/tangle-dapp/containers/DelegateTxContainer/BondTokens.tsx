import { BN_ZERO } from '@polkadot/util';
import {
  CopyWithTooltip,
  DropdownField,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import AmountInput from '../../components/AmountInput/AmountInput';
import { BondTokensProps } from './types';

const BondTokens: FC<BondTokensProps> = ({
  isFirstTimeNominator,
  nominatorAddress,
  amountToBond,
  setAmountToBond,
  paymentDestinationOptions,
  paymentDestination,
  setPaymentDestination,
  walletBalance,
  handleAmountToBondError,
}) => {
  return (
    <div className="grid grid-cols-3 gap-9">
      <div className="flex flex-col gap-9 col-span-2">
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

        <div>
          <AmountInput
            id="nominate-bond-token"
            title={isFirstTimeNominator ? 'Amount' : 'Amount (optional)'}
            max={walletBalance ?? undefined}
            amount={amountToBond}
            setAmount={setAmountToBond}
            baseInputOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough available balance"
            setErrorMessage={handleAmountToBondError}
          />
        </div>

        {/* Payment Destination */}
        {amountToBond && amountToBond.gt(BN_ZERO) && (
          <DropdownField
            title="Payment Destination"
            items={paymentDestinationOptions}
            selectedItem={paymentDestination}
            setSelectedItem={setPaymentDestination}
          />
        )}
      </div>

      <div className="flex flex-col gap-9 col-span-1">
        <Typography variant="body1" fw="normal">
          The amount placed at-stake should not be your full available amount to
          allow for transaction fees.
        </Typography>

        <Typography variant="body1" fw="normal">
          Once bonded, it will need to be unlocked/withdrawn and will be locked
          for at least the bonding duration.
        </Typography>

        {amountToBond && amountToBond.gt(BN_ZERO) && (
          <Typography variant="body1" fw="normal">
            Rewards (once paid) can be deposited to your account, unless
            otherwise configured.
          </Typography>
        )}
      </div>
    </div>
  );
};

export default BondTokens;
