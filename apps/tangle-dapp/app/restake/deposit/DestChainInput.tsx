'use client';

import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useMemo } from 'react';
import type { UseFormWatch } from 'react-hook-form';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import type { DepositFormFields } from '../../../types/restake';
import type { IdentityType } from '../../../utils/polkadot';
import AvatarWithText from '../AvatarWithText';
import SelectorPlaceholder from '../SelectorPlaceholder';

type Props = {
  openOperatorModal: () => void;
  watch: UseFormWatch<DepositFormFields>;
  operatorIdentities?: Record<string, IdentityType | null> | null;
};

const DestChainInput = ({
  openOperatorModal,
  watch,
  operatorIdentities,
}: Props) => {
  const operatorAccountId = watch('operatorAccountId');
  const selectedAssetId = watch('depositAssetId');

  const { assetMap } = useRestakeContext();
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const depositedBalance = useMemo(() => {
    if (!isDefined(selectedAssetId)) return;

    if (!isDefined(delegatorInfo)) return;

    const amount = delegatorInfo.deposits[selectedAssetId]?.amount;
    if (!isDefined(amount)) return;

    const asset = assetMap[selectedAssetId];
    if (!isDefined(asset)) return;

    return +formatUnits(amount, asset.decimals);
  }, [assetMap, delegatorInfo, selectedAssetId]);

  return (
    <TransactionInputCard.Root>
      <TransactionInputCard.Header className="min-h-[55px]">
        <TransactionInputCard.ChainSelector
          placeholder="Select Operator (Optional)"
          disabled
        />

        <TransactionInputCard.MaxAmountButton
          maxAmount={depositedBalance}
          accountType="note"
          tooltipBody="Deposited balance"
          disabled
        />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body
        hiddenAmountInput
        tokenSelectorProps={{
          onClick: openOperatorModal,
          placeholder: (
            <SelectorPlaceholder Icon={<Avatar value="" className="mr-2" />}>
              Operator
            </SelectorPlaceholder>
          ),
          children: operatorAccountId && (
            <AvatarWithText
              identityName={operatorIdentities?.[operatorAccountId]?.name}
              accountAddress={operatorAccountId}
              overrideTypographyProps={{ variant: 'h5' }}
            />
          ),
        }}
      />
    </TransactionInputCard.Root>
  );
};

export default DestChainInput;
