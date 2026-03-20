import { FC, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import AmountInput from '../../components/payments/AmountInput';
import ProofProgressIndicator from '../../components/payments/ProofProgressIndicator';
import { useShieldedContext } from '../../app/ShieldedProvider';
import { useCreditsContext } from '../../app/CreditsProvider';
import { ProofStage, type ProofProgress } from '../../types/shielded';
// TODO(sdk-link): When @tangle-network/shielded-sdk is linked:
//   import { ShieldedGatewayClient } from '@tangle-network/shielded-sdk'
//   const receipt = await client.fundCredits({
//     signer, keypair, amount: parsedAmount,
//     commitment: creditKeys.commitment,
//     spendingKey: creditKeys.spendingPublicKey,
//     noteManager
//   })

const FundCreditsContainer: FC = () => {
  const { address } = useAccount();
  const { shieldedBalance, keypair, deriveKeypair } = useShieldedContext();
  const { generateAndStoreCreditKeys, creditAccounts } = useCreditsContext();

  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [progress, setProgress] = useState<ProofProgress>({
    stage: ProofStage.IDLE,
  });
  const [fundedCommitment, setFundedCommitment] = useState<string | null>(null);

  const handleFund = useCallback(async () => {
    if (!address || !amount) return;

    let kp = keypair;
    if (!kp) {
      kp = await deriveKeypair();
      if (!kp) return;
    }

    try {
      // Step 1: Generate ephemeral credit keys
      setProgress({
        stage: ProofStage.FETCHING_ARTIFACTS,
        message: 'Generating ephemeral credit account keys...',
      });

      const creditKeys = await generateAndStoreCreditKeys(
        label || `Account ${creditAccounts.length + 1}`,
      );

      // Step 2: Build shielded withdrawal proof
      setProgress({
        stage: ProofStage.GENERATING_PROOF,
        message:
          'SDK not yet linked — proof generation requires @tangle-network/shielded-sdk. ' +
          `Credit account created: ${creditKeys.commitment.slice(0, 18)}...`,
      });

      // When SDK is linked:
      // 1. client.buildShieldedWithdrawal({ keypair, amount, noteManager })
      // 2. gateway.shieldedFundCredits(anchorProof, commitment, spendingKey)
      // 3. Remove spent notes, add change note

      setFundedCommitment(creditKeys.commitment);
      setProgress({
        stage: ProofStage.DONE,
        message:
          'Credit keys generated and stored locally. ' +
          'On-chain funding requires @tangle-network/shielded-sdk integration.',
      });
      setAmount('');
      setLabel('');
    } catch (err) {
      setProgress({
        stage: ProofStage.ERROR,
        message: err instanceof Error ? err.message : 'Fund credits failed',
      });
    }
  }, [
    address,
    amount,
    label,
    keypair,
    deriveKeypair,
    generateAndStoreCreditKeys,
    creditAccounts.length,
  ]);

  const isProcessing =
    progress.stage !== ProofStage.IDLE &&
    progress.stage !== ProofStage.DONE &&
    progress.stage !== ProofStage.ERROR;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-mono-200 dark:text-mono-0">
        Fund Credit Account
      </h2>

      <p className="text-sm text-mono-120 dark:text-mono-80">
        Create an anonymous prepaid credit account funded from your shielded
        pool balance. One ZK proof here enables many cheap pay-per-job
        signatures later.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium text-mono-140 dark:text-mono-80">
          Account Label (optional)
        </label>

        <input
          type="text"
          placeholder="e.g. AI Inference, Dev Testing"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={isProcessing}
          className="w-full p-3 text-sm border rounded-lg border-mono-40 dark:border-mono-160 bg-mono-0 dark:bg-mono-200 outline-none text-mono-200 dark:text-mono-0 placeholder:text-mono-80"
        />
      </div>

      <AmountInput
        value={amount}
        onChange={setAmount}
        balance={shieldedBalance}
        symbol="SHIELDED"
        label="Fund Amount"
        disabled={isProcessing}
      />

      <ProofProgressIndicator progress={progress} />

      {fundedCommitment && (
        <div className="p-3 text-sm border rounded-lg border-blue-50/30 bg-blue-50/5 text-blue-70 dark:text-blue-50">
          Credit keys stored locally.
          <p className="mt-1 font-mono text-xs break-all">{fundedCommitment}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleFund}
        disabled={!address || !amount || isProcessing || shieldedBalance === 0n}
        className="w-full px-4 py-3 text-sm font-semibold text-white rounded-lg bg-blue-50 hover:bg-blue-70 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Fund Credits'}
      </button>
    </div>
  );
};

export default FundCreditsContainer;
