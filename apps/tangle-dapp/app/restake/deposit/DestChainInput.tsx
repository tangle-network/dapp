'use client';

import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import type { UseFormWatch } from 'react-hook-form';

import type { DepositFormFields } from '../../../types/restake';
import AvatarWithText from '../AvatarWithText';
import SelectorPlaceholder from '../SelectorPlaceholder';

type Props = {
  openOperatorModal: () => void;
  watch: UseFormWatch<DepositFormFields>;
};

const DestChainInput = ({ openOperatorModal, watch }: Props) => {
  const operatorAccountId = watch('operatorAccountId');

  return (
    <TransactionInputCard.Root>
      <TransactionInputCard.Header className="min-h-[55px]">
        <TransactionInputCard.MaxAmountButton accountType="note" disabled />
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
