'use client';

import { FC, useState } from 'react';

import TransferTxModal from '../../containers/TransferTxModal';
import GlassCardWithLogo from '../GlassCardWithLogo';
import AccountAddress from './AccountAddress';
import Actions from './Actions';
import Balance from './Balance';

const AccountSummaryCard: FC<{ className?: string }> = ({ className }) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <>
      <GlassCardWithLogo className={className}>
        <div className="w-full space-y-5">
          <header>
            <AccountAddress />
          </header>

          <Balance />

          <Actions openTransferModal={() => setIsTransferModalOpen(true)} />
        </div>
      </GlassCardWithLogo>

      {/**
       * Keep transfer modal outside to prevent it getting stuck
       * within the card. Interestingly, the modal gets caught within
       * the card due to the backdrop filter applied to the glass card
       * due to some internal CSS logic regarding stacking contexts.
       */}
      <TransferTxModal
        isModalOpen={isTransferModalOpen}
        setIsModalOpen={setIsTransferModalOpen}
      />
    </>
  );
};

export default AccountSummaryCard;
