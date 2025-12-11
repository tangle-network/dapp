import { FaucetIcon, SendPlanLineIcon } from '@tangle-network/icons';
import { FC, useState } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { TANGLE_FAUCET_URL } from '@tangle-network/ui-components';
import ActionItem from './ActionItem';

const Actions: FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const [_isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Show faucet for testnet chains
  const isTestnet = chainId === 31337 || chainId === 84532; // Anvil local or Base Sepolia

  const hasBalance = balance && balance.value > BigInt(0);

  return (
    <div className="flex items-center justify-start gap-4 overflow-x-auto">
      <ActionItem
        label="Send"
        Icon={SendPlanLineIcon}
        onClick={() => setIsTransferModalOpen(true)}
        isDisabled={!address || !hasBalance}
      />

      {isTestnet && (
        <ActionItem
          label="Faucet"
          tooltip="Request testnet assets from the Tangle Network Faucet"
          Icon={FaucetIcon}
          externalHref={TANGLE_FAUCET_URL}
        />
      )}
    </div>
  );
};

export default Actions;
