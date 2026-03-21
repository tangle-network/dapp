import { FC, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Typography,
  Alert,
  Button,
  Input,
} from '@tangle-network/ui-components';
import AmountInput from '../../components/payments/AmountInput';
import ProofProgressIndicator from '../../components/payments/ProofProgressIndicator';
import { useShieldedContext } from '../../app/ShieldedProvider';
import { useCreditsContext } from '../../app/CreditsProvider';
import { ProofStage, type ProofProgress } from '../../types/shielded';

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
      setProgress({
        stage: ProofStage.FETCHING_ARTIFACTS,
        message: 'Generating ephemeral credit account keys...',
      });

      const creditKeys = await generateAndStoreCreditKeys(
        label || `Account ${creditAccounts.length + 1}`,
      );

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
      <div>
        <Typography variant="h5" fw="semibold">
          Fund Credit Account
        </Typography>

        <Typography variant="body2" className="mt-1 text-mono-100">
          Create an anonymous prepaid credit account funded from your shielded
          pool balance. One ZK proof enables many cheap pay-per-job signatures.
        </Typography>
      </div>

      <div className="space-y-1">
        <Typography variant="body2" fw="semibold" className="text-mono-120">
          Account Label (optional)
        </Typography>

        <Input
          id="credit-label"
          value={label}
          onChange={setLabel}
          isControlled
          isDisabled={isProcessing}
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
        <Alert type="success" title="Credit keys stored locally">
          <Typography variant="mono2" className="mt-1 break-all">
            {fundedCommitment}
          </Typography>
        </Alert>
      )}

      <Button
        isFullWidth
        onClick={handleFund}
        isDisabled={
          !address || !amount || isProcessing || shieldedBalance === 0n
        }
        isLoading={isProcessing}
        loadingText="Processing..."
      >
        Generate Credit Keys
      </Button>
    </div>
  );
};

export default FundCreditsContainer;
