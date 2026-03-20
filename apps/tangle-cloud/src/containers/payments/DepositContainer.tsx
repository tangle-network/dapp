import { FC, useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address } from 'viem';
import AmountInput from '../../components/payments/AmountInput';
import { useShieldedContext } from '../../app/ShieldedProvider';
import useTokenBalance from '../../data/payments/useTokenBalance';
import { WRAPPED_TOKEN_ADDRESS } from '../../constants/payments';

// Deposit is disabled until @tangle-network/shielded-sdk is linked.
// Token approval without atomic deposit creates dangling allowances.

const DepositContainer: FC = () => {
  const { address } = useAccount();
  const { hasDerivedKeypair, hasStoredKeypair, deriveKeypair, unlockKeypair } =
    useShieldedContext();

  const [amount, setAmount] = useState('');

  const { data: balance } = useTokenBalance(
    WRAPPED_TOKEN_ADDRESS as Address,
    address,
  );

  const needsKeypair = !hasDerivedKeypair;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-mono-200 dark:text-mono-0">
        Deposit to Shielded Pool
      </h2>

      <p className="text-sm text-mono-120 dark:text-mono-80">
        Move tokens from your public wallet into the shielded pool. A ZK proof
        will be generated and a shielded note stored in your browser.
      </p>

      {needsKeypair && (
        <div className="p-3 text-sm border rounded-lg border-yellow-50/30 bg-yellow-50/5 text-yellow-70 dark:text-yellow-50">
          {hasStoredKeypair ? (
            <>
              Unlock your shielded keypair to continue.
              <button
                type="button"
                onClick={() => unlockKeypair()}
                className="block mt-2 font-medium underline"
              >
                Unlock Keypair
              </button>
            </>
          ) : (
            <>
              Derive a shielded keypair first (one-time wallet signature).
              <button
                type="button"
                onClick={() => deriveKeypair()}
                className="block mt-2 font-medium underline"
              >
                Derive Keypair
              </button>
            </>
          )}
        </div>
      )}

      <AmountInput
        value={amount}
        onChange={setAmount}
        balance={balance as bigint | undefined}
        symbol="WRAPPED"
        disabled
      />

      <div className="p-3 text-sm border rounded-lg border-mono-40 dark:border-mono-160 bg-mono-20 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
        Deposits require @tangle-network/shielded-sdk integration for ZK proof
        generation. Token approval and deposit are executed atomically to
        prevent dangling allowances.
      </div>

      <button
        type="button"
        disabled
        className="w-full px-4 py-3 text-sm font-semibold text-white rounded-lg bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Deposit (SDK Required)
      </button>

      {!WRAPPED_TOKEN_ADDRESS && (
        <p className="text-xs text-red-70 dark:text-red-50">
          Set VITE_WRAPPED_TOKEN_ADDRESS in .env to enable deposits.
        </p>
      )}
    </div>
  );
};

export default DepositContainer;
