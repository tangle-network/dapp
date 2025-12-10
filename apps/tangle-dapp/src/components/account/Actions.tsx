import {
  FaucetIcon,
  GiftLineIcon,
  SendPlanLineIcon,
} from '@tangle-network/icons';
import { FC, useState } from 'react';

import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useBalances from '@tangle-network/tangle-shared-ui/hooks/useBalances';
import { TANGLE_FAUCET_URL } from '@tangle-network/ui-components';
import TransferTxModal from '../../containers/TransferTxModal';
import useAirdropEligibility from '../../data/claims/useAirdropEligibility';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature, PagePath } from '../../types';
import ActionItem from './ActionItem';
import WithdrawEvmBalanceAction from './WithdrawEvmBalanceAction';
import { ClaimCreditsModal } from '../../features/claimCredits';

const Actions: FC = () => {
  const activeAccountAddress = useActiveAccountAddress();
  const { transferable: transferableBalance } = useBalances();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const networkFeatures = useNetworkFeatures();

  const { isEligible: isAirdropEligible } = useAirdropEligibility();

  return (
    <div className="flex items-center justify-start gap-4 overflow-x-auto">
      <ActionItem
        label="Send"
        Icon={SendPlanLineIcon}
        onClick={() => setIsTransferModalOpen(true)}
        isDisabled={
          activeAccountAddress === null ||
          transferableBalance === null ||
          transferableBalance.isZero()
        }
      />

      {networkFeatures.includes(NetworkFeature.Faucet) && (
        <ActionItem
          label="Faucet"
          tooltip="Request testnet assets from the Tangle Network Faucet"
          Icon={FaucetIcon}
          externalHref={TANGLE_FAUCET_URL}
        />
      )}

      {isAirdropEligible && (
        <ActionItem
          label="Airdrop"
          hasNotificationDot={isAirdropEligible}
          isDisabled={!isAirdropEligible || activeAccountAddress === null}
          Icon={GiftLineIcon}
          internalHref={PagePath.CLAIM_AIRDROP}
          tooltip={
            <>
              Congratulations, you are eligible for the Tangle Network airdrop!
              Click here to visit the <strong>Claim Airdrop</strong> page.
            </>
          }
        />
      )}

      <WithdrawEvmBalanceAction />

      <TransferTxModal
        isModalOpen={isTransferModalOpen}
        setIsModalOpen={setIsTransferModalOpen}
      />

      <ClaimCreditsModal
        isOpen={isCreditsModalOpen}
        setIsOpen={setIsCreditsModalOpen}
      />
    </div>
  );
};

export default Actions;
