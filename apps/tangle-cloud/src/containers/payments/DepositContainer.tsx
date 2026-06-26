import { FC, useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address } from 'viem';
import { Alert, Button, Text } from '../../components/sandbox/SandboxUi';
import AmountInput from '../../components/payments/AmountInput';
import { useShieldedContext } from '../../app/ShieldedProvider';
import useTokenBalance from '../../data/payments/useTokenBalance';
import { WRAPPED_TOKEN_ADDRESS } from '../../constants/payments';

const DepositContainer: FC = () => {
  const { address } = useAccount();
  const {
    hasDerivedKeypair,
    hasStoredKeypair,
    deriveKeypair,
    unlockKeypair,
    isDerivingKeypair,
  } = useShieldedContext();

  const [amount, setAmount] = useState('');

  const { data: balance } = useTokenBalance(
    WRAPPED_TOKEN_ADDRESS as Address,
    address,
  );

  return (
    <div className="space-y-4">
      <div>
        <Text variant="h5" fw="semibold">
          Deposit to Shielded Pool
        </Text>

        <Text variant="body2" className="mt-1 text-mono-100 dark:text-mono-60">
          Move tokens from your public wallet into the shielded pool. A ZK proof
          will be generated and a shielded note stored in your browser.
        </Text>
      </div>

      {!hasDerivedKeypair && (
        <Alert
          type="warning"
          title={hasStoredKeypair ? 'Keypair locked' : 'Keypair required'}
          description={
            hasStoredKeypair
              ? 'Sign a message to unlock your shielded keypair.'
              : 'Sign a one-time message to derive your shielded keypair.'
          }
        >
          <Button
            variant="utility"
            size="sm"
            isLoading={isDerivingKeypair}
            onClick={() =>
              hasStoredKeypair ? unlockKeypair() : deriveKeypair()
            }
            className="mt-2"
          >
            {hasStoredKeypair ? 'Unlock Keypair' : 'Derive Keypair'}
          </Button>
        </Alert>
      )}

      <AmountInput
        value={amount}
        onChange={setAmount}
        balance={balance as bigint | undefined}
        symbol="WRAPPED"
        disabled
      />

      <Alert
        type="info"
        description="Deposits require @tangle-network/shielded-sdk for ZK proof generation. Token approval and deposit execute atomically."
      />

      <Button isFullWidth isDisabled disabledTooltip="SDK integration pending">
        Deposit
      </Button>

      {!WRAPPED_TOKEN_ADDRESS && (
        <Alert
          type="error"
          description="Set VITE_WRAPPED_TOKEN_ADDRESS in .env to enable deposits."
        />
      )}
    </div>
  );
};

export default DepositContainer;
