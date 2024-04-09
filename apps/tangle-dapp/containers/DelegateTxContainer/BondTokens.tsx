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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-9 items-center">
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

        <Typography variant="body1" fw="normal" className="!max-w-[365px]">
          By staking tokens and nominating validators, you are bonding your
          tokens to secure the network.
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-9 items-center">
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

        <Typography variant="body1" fw="normal" className="!max-w-[365px]">
          To unbond staked tokens, a duration of 28 eras (apprx. 28 days) where
          they remain inactive and will not earn rewards.
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-9 items-center">
        {/* Payment Destination */}
        {amountToBond !== null && amountToBond.gt(BN_ZERO) && (
          <>
            <DropdownField
              title="Payment Destination"
              items={paymentDestinationOptions}
              selectedItem={paymentDestination}
              setSelectedItem={setPaymentDestination}
            />

            <Typography variant="body1" fw="normal" className="!max-w-[365px]">
              {`By selecting 'Increase the amount at stake', your rewards will be
              automatically reinvested to maximize compounding.`}
            </Typography>
          </>
        )}
      </div>
    </div>
  );
};

export default BondTokens;
