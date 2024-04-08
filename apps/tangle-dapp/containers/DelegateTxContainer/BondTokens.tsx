import {
  Button,
  CopyWithTooltip,
  DropdownField,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { BondTokensProps } from './types';

const BondTokens: FC<BondTokensProps> = ({
  isFirstTimeNominator,
  nominatorAddress,
  amountToBond,
  setAmountToBond,
  amountToBondError,
  amountWalletBalance,
  paymentDestinationOptions,
  paymentDestination,
  setPaymentDestination,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

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
        {/* Amount */}
        <InputField.Root error={amountToBondError}>
          <InputField.Input
            title={isFirstTimeNominator ? 'Amount' : 'Amount (optional)'}
            isAddressType={false}
            value={amountToBond.toString()}
            isDisabled={
              isFirstTimeNominator
                ? amountWalletBalance > 0
                  ? false
                  : true
                : false
            }
            placeholder={`10 ${nativeTokenSymbol}`}
            type="number"
            onChange={(e) => setAmountToBond(Number(e.target.value))}
          />

          <InputField.Slot>
            <Button
              variant="utility"
              size="sm"
              isDisabled={amountWalletBalance > 0 ? false : true}
              onClick={() => setAmountToBond(amountWalletBalance)}
            >
              MAX
            </Button>
          </InputField.Slot>
        </InputField.Root>

        <Typography variant="body1" fw="normal" className="!max-w-[365px]">
          To unbond staked tokens, a duration of 28 eras (apprx. 28 days) where
          they remain inactive and will not earn rewards.
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-9 items-center">
        {/* Payment Destination */}
        {amountToBond > 0 && (
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
