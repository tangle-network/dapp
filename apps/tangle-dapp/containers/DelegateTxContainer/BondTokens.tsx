import { BN_ZERO } from '@polkadot/util';
import {
  CopyWithTooltip,
  DropdownField,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import _ from 'lodash';
import { type FC, useCallback } from 'react';
import z from 'zod';

import AmountInput from '../../components/AmountInput';
import {
  STAKING_PAYEE_TEXT_TO_VALUE_MAP,
  STAKING_PAYEE_VALUE_TO_TEXT_MAP,
} from '../../constants';
import useBalances from '../../data/balances/useBalances';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { StakingRewardsDestinationDisplayText } from '../../types/index';
import { BondTokensProps } from './types';

const BondTokens: FC<BondTokensProps> = ({
  isBondedOrNominating,
  amountToBond,
  setAmountToBond,
  payeeOptions,
  payee,
  setPayee,
  handleAmountToBondError,
}) => {
  const activeAccountAddress = useActiveAccountAddress();
  const { free: freeBalance } = useBalances();

  const handleSetPayee = useCallback(
    (newPayeeString: string) => {
      const payeeDisplayText = z
        .nativeEnum(StakingRewardsDestinationDisplayText)
        .parse(newPayeeString);

      setPayee(STAKING_PAYEE_TEXT_TO_VALUE_MAP[payeeDisplayText]);
    },
    [setPayee],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-9 items-center">
        {/* Account */}
        <InputField.Root>
          <InputField.Input
            title="Account"
            isAddressType
            value={activeAccountAddress ?? ''}
            type="text"
            readOnly
          />

          {activeAccountAddress !== null && (
            <InputField.Slot>
              <CopyWithTooltip
                textToCopy={activeAccountAddress}
                isButton={false}
                iconSize="lg"
                className="text-mono-160 dark:text-mono-80"
              />
            </InputField.Slot>
          )}
        </InputField.Root>

        <Typography variant="body1" fw="normal" className="!max-w-[365px]">
          By staking tokens and nominating validators, you are bonding your
          tokens to secure the network.
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-9 items-center">
        <AmountInput
          id="nominate-bond-token"
          title={!isBondedOrNominating ? 'Amount' : 'Amount (optional)'}
          max={freeBalance ?? undefined}
          amount={amountToBond}
          setAmount={setAmountToBond}
          wrapperOverrides={{ isFullWidth: true }}
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
              items={payeeOptions}
              selectedItem={STAKING_PAYEE_VALUE_TO_TEXT_MAP[payee]}
              setSelectedItem={handleSetPayee}
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
