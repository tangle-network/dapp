import { FC, useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import ProofProgressIndicator from '../../components/payments/ProofProgressIndicator';
import AmountInput from '../../components/payments/AmountInput';
import NoteCard from '../../components/payments/NoteCard';
import { useShieldedContext } from '../../app/ShieldedProvider';
import { ProofStage, type ProofProgress } from '../../types/shielded';
import { getCircuitArtifactsForBrowser } from '../../utils/payments/sdkBridge';

// TODO(sdk-link): When @tangle-network/shielded-sdk is added:
//   import { ShieldedGatewayClient } from '@tangle-network/shielded-sdk'
//   const { anchorProof, spentNotes, changeNote } =
//     await client.buildShieldedWithdrawal({ keypair, amount, noteManager })

const WithdrawContainer: FC = () => {
  const { address } = useAccount();
  const { notes, shieldedBalance, keypair, deriveKeypair } =
    useShieldedContext();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [progress, setProgress] = useState<ProofProgress>({
    stage: ProofStage.IDLE,
  });

  const confirmedNotes = useMemo(
    () => notes.filter((n) => n.index !== undefined),
    [notes],
  );

  const isValidRecipient = recipient === '' || isAddress(recipient);

  const handleWithdraw = useCallback(async () => {
    if (!address || !amount || !recipient || !isAddress(recipient)) return;

    let kp = keypair;
    if (!kp) {
      kp = await deriveKeypair();
      if (!kp) return;
    }

    try {
      setProgress({ stage: ProofStage.FETCHING_ARTIFACTS });
      const artifacts = getCircuitArtifactsForBrowser(2, 8);

      setProgress({
        stage: ProofStage.GENERATING_PROOF,
        message:
          'SDK not yet linked — proof generation requires @tangle-network/shielded-sdk. ' +
          `Artifacts: ${artifacts.wasmPath.split('/').pop()}`,
      });

      // When SDK is linked, the flow is:
      // 1. noteManager.selectNotesFifo(chainId, poolAddress, parsedAmount)
      // 2. client.buildShieldedWithdrawal({ keypair, amount, noteManager })
      // 3. Submit anchorProof to VAnchor contract
      // 4. Remove spent notes, add change note

      setProgress({
        stage: ProofStage.ERROR,
        message: 'Link @tangle-network/shielded-sdk to enable withdrawals.',
      });
    } catch (err) {
      setProgress({
        stage: ProofStage.ERROR,
        message: err instanceof Error ? err.message : 'Withdraw failed',
      });
    }
  }, [address, amount, recipient, keypair, deriveKeypair]);

  const isProcessing =
    progress.stage !== ProofStage.IDLE &&
    progress.stage !== ProofStage.DONE &&
    progress.stage !== ProofStage.ERROR;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-mono-200 dark:text-mono-0">
        Withdraw from Shielded Pool
      </h2>

      <p className="text-sm text-mono-120 dark:text-mono-80">
        Withdraw shielded tokens to a public address. Notes are selected
        automatically (FIFO). Change is returned as a new note.
      </p>

      {confirmedNotes.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-mono-140 dark:text-mono-80">
            Available Notes ({confirmedNotes.length})
          </span>

          <div className="flex flex-wrap gap-1">
            {confirmedNotes.slice(0, 5).map((note) => (
              <NoteCard
                key={`${note.privateKey}:${note.blinding}`}
                note={note}
                compact
              />
            ))}

            {confirmedNotes.length > 5 && (
              <span className="self-center text-xs text-mono-100">
                +{confirmedNotes.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <AmountInput
        value={amount}
        onChange={setAmount}
        balance={shieldedBalance}
        symbol="SHIELDED"
        label="Withdraw Amount"
        disabled={isProcessing}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium text-mono-140 dark:text-mono-80">
          Recipient Address
        </label>

        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={isProcessing}
          className={`w-full p-3 text-sm font-mono border rounded-lg bg-mono-0 dark:bg-mono-200 outline-none text-mono-200 dark:text-mono-0 placeholder:text-mono-80 ${
            !isValidRecipient
              ? 'border-red-50'
              : 'border-mono-40 dark:border-mono-160'
          }`}
        />

        {!isValidRecipient && (
          <p className="text-xs text-red-70 dark:text-red-50">
            Invalid Ethereum address
          </p>
        )}
      </div>

      <ProofProgressIndicator progress={progress} />

      <button
        type="button"
        onClick={handleWithdraw}
        disabled={
          !address ||
          !amount ||
          !recipient ||
          !isValidRecipient ||
          isProcessing ||
          confirmedNotes.length === 0
        }
        className="w-full px-4 py-3 text-sm font-semibold text-white rounded-lg bg-blue-50 hover:bg-blue-70 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Withdraw'}
      </button>
    </div>
  );
};

export default WithdrawContainer;
