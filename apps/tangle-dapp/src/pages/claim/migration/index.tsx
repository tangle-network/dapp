import { Card } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, useCallback, useState, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { type Hex } from 'viem';

import SubstrateKeyInput, {
  type SubstrateAddressInfo,
} from './components/SubstrateKeyInput';
import useClaimEligibility, {
  generateChallenge,
} from './hooks/useClaimEligibility';
import useGenerateProof from './hooks/useGenerateProof';
import useSubmitClaim from './hooks/useSubmitClaim';

enum ClaimStep {
  ENTER_ADDRESS = 0,
  SIGN_CHALLENGE = 1,
  GENERATE_PROOF = 2,
  SUBMIT_CLAIM = 3,
  COMPLETE = 4,
}

const MigrationClaimPage: FC = () => {
  const { address: evmAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();

  // Form state
  const [substrateInput, setSubstrateInput] = useState('');
  const [addressInfo, setAddressInfo] = useState<SubstrateAddressInfo | null>(
    null,
  );
  const [signature, setSignature] = useState<Hex | null>(null);
  const [currentStep, setCurrentStep] = useState<ClaimStep>(
    ClaimStep.ENTER_ADDRESS,
  );

  // Hooks
  const {
    eligibility,
    isLoading: isLoadingEligibility,
    contractAddress,
    contractConfigured,
  } = useClaimEligibility({
    ss58Address: addressInfo?.ss58Address ?? null,
  });

  const {
    proof,
    error: proofError,
    progress: proofProgress,
    generateProof,
    isGenerating,
  } = useGenerateProof();

  const {
    submitClaim,
    txHash,
    isSubmitting,
    isConfirming,
    isConfirmed,
    error: submitError,
  } = useSubmitClaim();

  // Generate challenge for signing
  // Challenge includes amount to bind signature to specific claim
  const challenge = useMemo((): Hex | null => {
    if (!contractAddress || !evmAddress || !eligibility.amount) return null;
    return generateChallenge(
      contractAddress,
      chainId,
      evmAddress,
      eligibility.amount,
    );
  }, [contractAddress, chainId, evmAddress, eligibility.amount]);

  // Handle substrate address input change
  const handleSubstrateAddressChange = useCallback(
    (value: string, info: SubstrateAddressInfo | null) => {
      setSubstrateInput(value);
      setAddressInfo(info);
      // Reset subsequent steps if address changes
      setSignature(null);
      setCurrentStep(ClaimStep.ENTER_ADDRESS);
    },
    [],
  );

  // Check if ready to proceed to signing
  const canProceedToSigning = useMemo(() => {
    return (
      addressInfo &&
      eligibility.isEligible &&
      !eligibility.hasClaimed &&
      !eligibility.isPaused &&
      eligibility.timeRemaining > BigInt(0) &&
      challenge &&
      isConnected
    );
  }, [addressInfo, eligibility, challenge, isConnected]);

  // Handle signing the challenge with polkadot.js extension
  const handleSignChallenge = useCallback(async () => {
    if (!challenge || !addressInfo) return;

    setCurrentStep(ClaimStep.SIGN_CHALLENGE);

    try {
      // This requires the polkadot.js browser extension
      const { web3Enable, web3FromAddress } = await import(
        '@polkadot/extension-dapp'
      );

      // Enable the extension
      const extensions = await web3Enable('Tangle Migration Claim');
      if (extensions.length === 0) {
        throw new Error(
          'Please install the Polkadot.js browser extension to sign',
        );
      }

      // The user needs to have imported their account into the extension
      const { web3Accounts } = await import('@polkadot/extension-dapp');
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        throw new Error('No accounts found in Polkadot.js extension');
      }

      // Find the account matching the SS58 address
      const matchingAccount = accounts.find(
        (acc) => acc.address === addressInfo.ss58Address,
      );

      if (!matchingAccount) {
        throw new Error(
          `Account ${addressInfo.ss58Address} not found in Polkadot.js extension. Please import your account first.`,
        );
      }

      // Get the signer for the matching account
      const injector = await web3FromAddress(matchingAccount.address);

      if (!injector.signer.signRaw) {
        throw new Error('Signer does not support raw signing');
      }

      // Sign the challenge
      const result = await injector.signer.signRaw({
        address: matchingAccount.address,
        data: challenge,
        type: 'bytes',
      });

      // Extract the signature (ensure 0x prefix)
      const sig = result.signature.startsWith('0x')
        ? result.signature
        : `0x${result.signature}`;

      setSignature(sig as Hex);
      setCurrentStep(ClaimStep.GENERATE_PROOF);
    } catch (err) {
      console.error('Failed to sign challenge:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to sign challenge. Please try again.',
      );
      setCurrentStep(ClaimStep.ENTER_ADDRESS);
    }
  }, [challenge, addressInfo]);

  // Handle proof generation
  const handleGenerateProof = useCallback(async () => {
    if (
      !addressInfo ||
      !signature ||
      !evmAddress ||
      !challenge ||
      !eligibility.amount
    ) {
      return;
    }

    try {
      await generateProof({
        ss58Address: addressInfo.ss58Address,
        signature,
        evmAddress: evmAddress as Hex,
        challenge,
        amount: eligibility.amount,
      });

      setCurrentStep(ClaimStep.SUBMIT_CLAIM);
    } catch (err) {
      console.error('Failed to generate proof:', err);
    }
  }, [
    addressInfo,
    signature,
    evmAddress,
    challenge,
    eligibility.amount,
    generateProof,
  ]);

  // Handle claim submission
  const handleSubmitClaim = useCallback(async () => {
    if (
      !addressInfo ||
      !eligibility.amount ||
      !eligibility.merkleProof ||
      !proof ||
      !evmAddress
    ) {
      return;
    }

    try {
      await submitClaim({
        ss58Address: addressInfo.ss58Address,
        amount: eligibility.amount,
        merkleProof: eligibility.merkleProof,
        zkProof: proof.zkProof,
        recipient: evmAddress as Hex,
      });
    } catch (err) {
      console.error('Failed to submit claim:', err);
    }
  }, [addressInfo, eligibility, proof, evmAddress, submitClaim]);

  // Format time remaining
  const formatTimeRemaining = useCallback((seconds: bigint): string => {
    const days = Number(seconds / BigInt(86400));
    const hours = Number((seconds % BigInt(86400)) / BigInt(3600));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }, []);

  // Render status based on step
  const renderStepStatus = useCallback(() => {
    if (isConfirmed) {
      return (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <Typography variant="h5" className="text-green-500 mb-2">
            Claim Successful!
          </Typography>
          <Typography variant="body2">
            Your TNT tokens have been claimed to your EVM address.
          </Typography>
          {txHash && (
            <Typography variant="body2" className="mt-2 font-mono text-xs">
              Transaction: {txHash}
            </Typography>
          )}
        </div>
      );
    }

    if (eligibility.hasClaimed) {
      return (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Typography variant="body1" className="text-yellow-500">
            This address has already claimed.
          </Typography>
        </div>
      );
    }

    if (eligibility.isPaused) {
      return (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Typography variant="body1" className="text-yellow-500">
            Claims are currently paused.
          </Typography>
        </div>
      );
    }

    if (eligibility.timeRemaining === BigInt(0) && addressInfo) {
      return (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <Typography variant="body1" className="text-red-500">
            The claim period has ended.
          </Typography>
        </div>
      );
    }

    return null;
  }, [eligibility, isConfirmed, txHash, addressInfo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-lg">
        <Card withShadow className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <Typography variant="h4" fw="bold" className="mb-2">
                TNT Migration Claim
              </Typography>
              <Typography variant="body2" className="text-mono-100">
                Claim your TNT tokens by proving ownership of your Substrate
                account
              </Typography>
            </div>

            {/* Time remaining */}
            {eligibility.timeRemaining > BigInt(0) && (
              <div className="text-center p-3 rounded-lg bg-mono-20 dark:bg-mono-170">
                <Typography variant="body2" className="text-mono-100">
                  Time remaining to claim:
                </Typography>
                <Typography variant="body1" fw="medium">
                  {formatTimeRemaining(eligibility.timeRemaining)}
                </Typography>
              </div>
            )}

            {/* Status messages */}
            {renderStepStatus()}

            {/* Step 1: Connect wallet */}
            {!isConnected && (
              <div className="space-y-4">
                <Typography variant="body1">
                  Connect your EVM wallet to begin the claim process.
                </Typography>
                <Button isFullWidth onClick={openConnectModal}>
                  Connect Wallet
                </Button>
              </div>
            )}

            {/* Steps when connected */}
            {isConnected && !isConfirmed && !eligibility.hasClaimed && (
              <div className="space-y-4">
                {/* Step 1: Enter Substrate address */}
                <div>
                  <Typography variant="body2" className="text-mono-100 mb-2">
                    Step 1: Enter your Substrate address
                  </Typography>
                  <SubstrateKeyInput
                    value={substrateInput}
                    onChange={handleSubstrateAddressChange}
                    disabled={currentStep > ClaimStep.ENTER_ADDRESS}
                  />
                </div>

                {/* Eligibility status */}
                {addressInfo && !isLoadingEligibility && (
                  <div
                    className={`p-3 rounded-lg ${
                      eligibility.isEligible
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    {eligibility.isEligible ? (
                      <>
                        <Typography
                          variant="body1"
                          fw="medium"
                          className="text-green-500"
                        >
                          Eligible for claim!
                        </Typography>
                        <Typography variant="body2" className="mt-1">
                          Claimable amount:{' '}
                          <span className="font-mono font-medium">
                            {eligibility.formattedBalance} TNT
                          </span>
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body1" className="text-red-500">
                        This address is not eligible for the migration claim.
                      </Typography>
                    )}
                  </div>
                )}

                {/* Step 2: Sign challenge */}
                {canProceedToSigning &&
                  currentStep === ClaimStep.ENTER_ADDRESS && (
                    <div className="space-y-2">
                      <Typography variant="body2" className="text-mono-100">
                        Step 2: Sign a challenge with your Substrate key
                      </Typography>
                      <Button isFullWidth onClick={handleSignChallenge}>
                        Sign with Polkadot.js Extension
                      </Button>
                    </div>
                  )}

                {/* Step 3: Generate proof */}
                {signature && currentStep === ClaimStep.GENERATE_PROOF && (
                  <div className="space-y-2">
                    <Typography variant="body2" className="text-mono-100">
                      Step 3: Generate ZK proof of key ownership
                    </Typography>
                    {proofProgress && (
                      <Typography variant="body2" className="text-blue-500">
                        {proofProgress}
                      </Typography>
                    )}
                    {proofError && (
                      <Typography variant="body2" className="text-red-500">
                        {proofError}
                      </Typography>
                    )}
                    <Button
                      isFullWidth
                      onClick={handleGenerateProof}
                      isLoading={isGenerating}
                      loadingText="Generating proof..."
                    >
                      Generate Proof
                    </Button>
                  </div>
                )}

                {/* Step 4: Submit claim */}
                {proof && currentStep === ClaimStep.SUBMIT_CLAIM && (
                  <div className="space-y-2">
                    <Typography variant="body2" className="text-mono-100">
                      Step 4: Submit your claim on-chain
                    </Typography>
                    {submitError && (
                      <Typography variant="body2" className="text-red-500">
                        {submitError.message}
                      </Typography>
                    )}
                    <Button
                      isFullWidth
                      onClick={handleSubmitClaim}
                      isLoading={isSubmitting || isConfirming}
                      loadingText={
                        isConfirming ? 'Confirming...' : 'Submitting...'
                      }
                    >
                      Claim {eligibility.formattedBalance} TNT
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Contract not configured warning */}
            {!contractConfigured && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Typography variant="body2" className="text-yellow-500">
                  Migration claim contract not yet deployed. Claims will be
                  available soon.
                </Typography>
              </div>
            )}
          </div>
        </Card>

        {/* Info section */}
        <div className="mt-6 p-4 rounded-lg bg-mono-20 dark:bg-mono-180">
          <Typography variant="h5" fw="medium" className="mb-2">
            How it works
          </Typography>
          <ol className="list-decimal list-inside space-y-2 text-sm text-mono-100">
            <li>Enter your Substrate address to check eligibility</li>
            <li>
              Sign a challenge message with your SR25519 key using the
              Polkadot.js extension
            </li>
            <li>Generate a ZK proof verifying your key ownership</li>
            <li>Submit the claim transaction to receive your TNT tokens</li>
          </ol>
          <Typography variant="body2" className="mt-4 text-mono-100">
            You have 1 year from the migration start date to claim your tokens.
            After this period, unclaimed tokens will be returned to the
            treasury.
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default MigrationClaimPage;
