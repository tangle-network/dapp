import { FC, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Typography,
  Alert,
  Button,
  Input,
} from '@tangle-network/ui-components';
import { useShieldedContext } from '../../app/ShieldedProvider';
import { useCreditsContext } from '../../app/CreditsProvider';

const FundCreditsContainer: FC = () => {
  const { address } = useAccount();
  const { hasDerivedKeypair } = useShieldedContext();
  const { generateAndStoreCreditKeys, creditAccounts, isUnlocked } =
    useCreditsContext();

  const [label, setLabel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fundedCommitment, setFundedCommitment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!address) return;

    setIsGenerating(true);
    setError(null);
    setFundedCommitment(null);

    try {
      const creditKeys = await generateAndStoreCreditKeys(
        label || `Account ${creditAccounts.length + 1}`,
      );
      setFundedCommitment(creditKeys.commitment);
      setLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate keys');
    } finally {
      setIsGenerating(false);
    }
  }, [address, label, generateAndStoreCreditKeys, creditAccounts.length]);

  return (
    <div className="space-y-4">
      <div>
        <Typography variant="h5" fw="semibold">
          Create Credit Account
        </Typography>

        <Typography variant="body2" className="mt-1 text-mono-100">
          Generate an ephemeral keypair for anonymous credit payments. The keys
          are encrypted and stored in your browser. On-chain funding requires
          SDK integration.
        </Typography>
      </div>

      {!hasDerivedKeypair && (
        <Alert
          type="warning"
          description="Unlock your shielded keypair before creating credit accounts. Credit keys are encrypted using your shielded key."
        />
      )}

      <div className="space-y-1">
        <Typography variant="body2" fw="semibold" className="text-mono-120">
          Account Label (optional)
        </Typography>

        <Input
          id="credit-label"
          value={label}
          onChange={setLabel}
          isControlled
          isDisabled={isGenerating || !isUnlocked}
        />
      </div>

      {error && <Alert type="error" description={error} />}

      {fundedCommitment && (
        <Alert type="success" title="Credit keys generated and stored">
          <Typography variant="mono2" className="mt-1 break-all">
            {fundedCommitment}
          </Typography>
        </Alert>
      )}

      <Button
        isFullWidth
        onClick={handleGenerate}
        isDisabled={!address || !isUnlocked || isGenerating}
        isLoading={isGenerating}
        loadingText="Generating..."
        disabledTooltip={
          !isUnlocked ? 'Unlock your shielded keypair first' : undefined
        }
      >
        Generate Credit Keys
      </Button>
    </div>
  );
};

export default FundCreditsContainer;
