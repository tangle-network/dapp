import { InformationLine } from '@tangle-network/icons';
import {
  Card,
  CardVariant,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import IconButton from '@tangle-network/ui-components/components/buttons/IconButton';
import { RecipientInput } from '@tangle-network/ui-components/components/BridgeInputs';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components/components/Tooltip';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, useCallback, useState, useMemo, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { type Hex, formatUnits, isAddress } from 'viem';
import { twMerge } from 'tailwind-merge';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AnimatePresence, motion } from 'framer-motion';

import SubstrateWalletSelector from './components/SubstrateWalletSelector';
import useClaimEligibility, {
  generateChallenge,
} from './hooks/useClaimEligibility';
import useGenerateProof from './hooks/useGenerateProof';
import useSubmitClaim from './hooks/useSubmitClaim';

enum ClaimStep {
  CONNECT_WALLETS = 0,
  CHECK_ELIGIBILITY = 1,
  SIGN_CHALLENGE = 2,
  GENERATE_PROOF = 3,
  SUBMIT_CLAIM = 4,
  COMPLETE = 5,
}

const MigrationClaimPage: FC = () => {
  const { address: evmAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();

  // State
  const [substrateAccount, setSubstrateAccount] =
    useState<InjectedAccountWithMeta | null>(null);
  const [signature, setSignature] = useState<Hex | null>(null);
  const [currentStep, setCurrentStep] = useState<ClaimStep>(
    ClaimStep.CONNECT_WALLETS,
  );
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isRecipientValid, setIsRecipientValid] = useState(true);

  // Sync recipient address with connected wallet when it changes
  useEffect(() => {
    if (evmAddress && !recipientAddress) {
      setRecipientAddress(evmAddress);
    }
  }, [evmAddress, recipientAddress]);

  // Hooks
  const {
    eligibility,
    isLoading: isLoadingEligibility,
    contractAddress,
    contractConfigured,
  } = useClaimEligibility({
    ss58Address: substrateAccount?.address ?? null,
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

  // Validate recipient address
  const validRecipient = useMemo((): Hex | null => {
    if (!recipientAddress || !isAddress(recipientAddress)) return null;
    return recipientAddress as Hex;
  }, [recipientAddress]);

  // Generate challenge for signing
  const challenge = useMemo((): Hex | null => {
    if (!contractAddress || !validRecipient || !eligibility.amount) return null;
    return generateChallenge(
      contractAddress,
      chainId,
      validRecipient,
      eligibility.amount,
    );
  }, [contractAddress, chainId, validRecipient, eligibility.amount]);

  // Update step when substrate account changes
  const handleAccountSelect = useCallback(
    (account: InjectedAccountWithMeta | null) => {
      setSubstrateAccount(account);
      setSignature(null);
      if (account && isConnected) {
        setCurrentStep(ClaimStep.CHECK_ELIGIBILITY);
      } else {
        setCurrentStep(ClaimStep.CONNECT_WALLETS);
      }
    },
    [isConnected],
  );

  // Check if ready to proceed to signing
  const canSign = useMemo(() => {
    return (
      substrateAccount &&
      eligibility.isEligible &&
      !eligibility.hasClaimed &&
      !eligibility.isPaused &&
      eligibility.timeRemaining > BigInt(0) &&
      challenge &&
      validRecipient &&
      isRecipientValid
    );
  }, [substrateAccount, eligibility, challenge, validRecipient, isRecipientValid]);

  // Handle signing the challenge
  const handleSignChallenge = useCallback(async () => {
    if (!challenge || !substrateAccount) return;

    setCurrentStep(ClaimStep.SIGN_CHALLENGE);

    try {
      const { web3FromAddress } = await import('@polkadot/extension-dapp');
      const injector = await web3FromAddress(substrateAccount.address);

      if (!injector.signer.signRaw) {
        throw new Error('Signer does not support raw signing');
      }

      const result = await injector.signer.signRaw({
        address: substrateAccount.address,
        data: challenge,
        type: 'bytes',
      });

      const sig = result.signature.startsWith('0x')
        ? result.signature
        : `0x${result.signature}`;

      setSignature(sig as Hex);
      setCurrentStep(ClaimStep.GENERATE_PROOF);
    } catch (err) {
      console.error('Failed to sign challenge:', err);
      setCurrentStep(ClaimStep.CHECK_ELIGIBILITY);
    }
  }, [challenge, substrateAccount]);

  // Handle proof generation
  const handleGenerateProof = useCallback(async () => {
    if (
      !substrateAccount ||
      !signature ||
      !validRecipient ||
      !challenge ||
      !eligibility.amount
    ) {
      return;
    }

    try {
      await generateProof({
        ss58Address: substrateAccount.address,
        signature,
        evmAddress: validRecipient,
        challenge,
        amount: eligibility.amount,
      });
      setCurrentStep(ClaimStep.SUBMIT_CLAIM);
    } catch (err) {
      console.error('Failed to generate proof:', err);
    }
  }, [
    substrateAccount,
    signature,
    validRecipient,
    challenge,
    eligibility.amount,
    generateProof,
  ]);

  // Handle claim submission
  const handleSubmitClaim = useCallback(async () => {
    if (
      !substrateAccount ||
      !eligibility.amount ||
      !eligibility.merkleProof ||
      !proof ||
      !validRecipient
    ) {
      return;
    }

    try {
      await submitClaim({
        ss58Address: substrateAccount.address,
        amount: eligibility.amount,
        merkleProof: eligibility.merkleProof,
        zkProof: proof.zkProof,
        recipient: validRecipient,
      });
      setCurrentStep(ClaimStep.COMPLETE);
    } catch (err) {
      console.error('Failed to submit claim:', err);
    }
  }, [substrateAccount, eligibility, proof, validRecipient, submitClaim]);

  // Format amount
  const formattedAmount = eligibility.amount
    ? formatUnits(eligibility.amount, 18)
    : '0';

  // Render claim success
  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Card withShadow className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-4xl text-green-500">&#10003;</span>
          </div>
          <Typography variant="h4" fw="bold" className="mb-2">
            Claim Successful!
          </Typography>
          <Typography variant="body1" className="text-mono-100 mb-4">
            Your TNT tokens have been claimed to your EVM address.
          </Typography>
          <Typography variant="body2" className="font-mono text-xs break-all text-mono-100">
            {txHash}
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid items-start justify-center gap-4 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <div>
        {/* Title */}
        <div className="mb-6">
          <Typography variant="h4" fw="bold" className="text-mono-0 dark:text-mono-0">
            Claim your TNT
          </Typography>
          <Typography variant="body2" className="text-mono-100 mt-1">
            Migrate your Substrate balance to the new EVM chain
          </Typography>
        </div>

        <Card withShadow className="relative w-full md:min-w-[480px] p-6">
          {/* Info button for How it works */}
          {!isHowItWorksOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  className="absolute top-4 -right-12 max-md:hidden"
                  onClick={() => setIsHowItWorksOpen(true)}
                >
                  <InformationLine className="w-5 h-5" />
                </IconButton>
              </TooltipTrigger>
              <TooltipBody>How it works</TooltipBody>
            </Tooltip>
          )}

          <div className="space-y-5">
            {/* Time remaining badge */}
            {eligibility.timeRemaining > BigInt(0) && (
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                  {Math.floor(Number(eligibility.timeRemaining) / 86400)} days remaining to claim
                </span>
              </div>
            )}

            {/* Status alerts */}
            {eligibility.hasClaimed && (
              <Card variant={CardVariant.GLASS} className="p-3 bg-yellow-500/10 border-yellow-500/20">
                <Typography variant="body2" className="text-yellow-500 text-center">
                  This address has already claimed.
                </Typography>
              </Card>
            )}

            {eligibility.isPaused && (
              <Card variant={CardVariant.GLASS} className="p-3 bg-yellow-500/10 border-yellow-500/20">
                <Typography variant="body2" className="text-yellow-500 text-center">
                  Claims are currently paused.
                </Typography>
              </Card>
            )}

            {!contractConfigured && (
              <Card variant={CardVariant.GLASS} className="p-3 bg-yellow-500/10 border-yellow-500/20">
                <Typography variant="body2" className="text-yellow-500 text-center">
                  Migration contract not yet deployed on this network.
                </Typography>
              </Card>
            )}

            {/* Step 1: Connect EVM Wallet */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={twMerge(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  isConnected ? 'bg-green-500 text-white' : 'bg-mono-100 text-mono-0'
                )}>
                  {isConnected ? '✓' : '1'}
                </div>
                <Typography variant="body1" fw="bold">
                  EVM Wallet
                </Typography>
              </div>

              {!isConnected ? (
                <Button isFullWidth onClick={openConnectModal}>
                  Connect EVM Wallet
                </Button>
              ) : (
                <RecipientInput
                  title="Receiving Address"
                  placeholder="Enter EVM address to receive TNT"
                  value={recipientAddress}
                  onChange={setRecipientAddress}
                  validate={isAddress}
                  isValidSet={setIsRecipientValid}
                  isHiddenPasteBtn={!!recipientAddress}
                  overrideInputProps={{
                    isDisabled: currentStep >= ClaimStep.SIGN_CHALLENGE,
                    className: 'font-mono text-sm',
                  }}
                />
              )}
            </div>

            {/* Step 2: Connect Polkadot Wallet */}
            {isConnected && !eligibility.hasClaimed && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={twMerge(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    substrateAccount ? 'bg-green-500 text-white' : 'bg-mono-100 text-mono-0'
                  )}>
                    {substrateAccount ? '✓' : '2'}
                  </div>
                  <Typography variant="body1" fw="bold">
                    Polkadot Wallet
                  </Typography>
                </div>

                <SubstrateWalletSelector
                  selectedAccount={substrateAccount}
                  onAccountSelect={handleAccountSelect}
                  disabled={currentStep >= ClaimStep.SIGN_CHALLENGE}
                />
              </div>
            )}

            {/* Eligibility Loading */}
            {substrateAccount && isLoadingEligibility && (
              <div className="space-y-3 p-4 rounded-lg bg-mono-20 dark:bg-mono-170">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <Typography variant="body2" className="text-mono-100">
                    Checking eligibility...
                  </Typography>
                </div>
                <SkeletonLoader className="h-8 w-32" />
              </div>
            )}

            {/* Eligibility Result */}
            {substrateAccount && !isLoadingEligibility && !eligibility.hasClaimed && (
              <Card
                variant={CardVariant.GLASS}
                className={twMerge(
                  'p-4',
                  eligibility.isEligible
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20',
                )}
              >
                {eligibility.isEligible ? (
                  <div className="text-center">
                    <Typography variant="body2" className="text-green-500 mb-1">
                      You are eligible to claim
                    </Typography>
                    <Typography variant="h4" fw="bold" className="text-green-500">
                      {Number(formattedAmount).toLocaleString()} TNT
                    </Typography>
                  </div>
                ) : (
                  <Typography variant="body2" className="text-red-500 text-center">
                    This address is not eligible for the migration claim.
                  </Typography>
                )}
              </Card>
            )}

            {/* Step 3: Sign & Claim Actions */}
            {canSign && currentStep === ClaimStep.CHECK_ELIGIBILITY && (
              <Button isFullWidth onClick={handleSignChallenge} className="py-3">
                Sign Ownership Proof
              </Button>
            )}

            {signature && currentStep === ClaimStep.GENERATE_PROOF && (
              <div className="space-y-3">
                {proofProgress && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <Typography variant="body2" className="text-blue-500">
                      {proofProgress}
                    </Typography>
                  </div>
                )}
                {proofError && (
                  <Typography variant="body2" className="text-red-500 text-center">
                    {proofError}
                  </Typography>
                )}
                <Button
                  isFullWidth
                  onClick={handleGenerateProof}
                  isLoading={isGenerating}
                  loadingText="Generating ZK Proof..."
                  className="py-3"
                >
                  Generate ZK Proof
                </Button>
              </div>
            )}

            {proof && currentStep === ClaimStep.SUBMIT_CLAIM && (
              <div className="space-y-3">
                {submitError && (
                  <Typography variant="body2" className="text-red-500 text-center">
                    {submitError.message}
                  </Typography>
                )}
                <Button
                  isFullWidth
                  onClick={handleSubmitClaim}
                  isLoading={isSubmitting || isConfirming}
                  loadingText={isConfirming ? 'Confirming...' : 'Submitting...'}
                  className="py-3"
                >
                  Claim {Number(formattedAmount).toLocaleString()} TNT
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* How it works - Horizontal expansion */}
      <AnimatePresence>
        {isHowItWorksOpen && (
          <motion.div
            key="how-it-works-panel"
            className="max-w-sm origin-[0_0_0] hidden md:block"
            transition={{ duration: 0.15 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Card withShadow className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" fw="bold">
                  How it works
                </Typography>
                <button
                  onClick={() => setIsHowItWorksOpen(false)}
                  className="text-mono-100 hover:text-mono-0 transition-colors"
                >
                  ✕
                </button>
              </div>

              <ol className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Connect EVM Wallet',
                    desc: 'Your TNT tokens will be sent to this address',
                  },
                  {
                    step: 2,
                    title: 'Connect Polkadot Wallet',
                    desc: 'Select the account with your claimable balance',
                  },
                  {
                    step: 3,
                    title: 'Sign Ownership Proof',
                    desc: 'Prove you own the Substrate private key',
                  },
                  {
                    step: 4,
                    title: 'Generate ZK Proof',
                    desc: 'Create a zero-knowledge proof of key ownership',
                  },
                  {
                    step: 5,
                    title: 'Submit Claim',
                    desc: 'Send the transaction to receive your TNT',
                  },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <Typography variant="body2" fw="medium">
                        {title}
                      </Typography>
                      <Typography variant="body2" className="text-mono-100 text-xs">
                        {desc}
                      </Typography>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 p-3 rounded-lg bg-mono-20 dark:bg-mono-170">
                <Typography variant="body2" className="text-mono-100 text-xs">
                  You have 1 year from the migration start date to claim your
                  tokens. After this period, unclaimed tokens will be returned
                  to the treasury.
                </Typography>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MigrationClaimPage;
