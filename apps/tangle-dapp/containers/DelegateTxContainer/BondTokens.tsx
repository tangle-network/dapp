import {
  Button,
  CopyWithTooltip,
  DropdownField,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

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
  tokenSymbol,
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

        {/* Amount */}
        {/* TODO: handle amount here */}
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
            placeholder={`10 ${tokenSymbol}`}
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

        {/* Payment Destination */}
        {amountToBond > 0 && (
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

        {amountToBond > 0 && (
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
