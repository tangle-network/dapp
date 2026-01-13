import {
  InformationLine,
  CheckboxCircleFill,
  EditLine,
  Alert,
} from '@tangle-network/icons';
import { Card, CopyWithTooltip } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import IconButton from '@tangle-network/ui-components/components/buttons/IconButton';
import { Input } from '@tangle-network/ui-components/components/Input';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components/components/Tooltip';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { EvmWalletModal } from '@tangle-network/tangle-shared-ui/components/EvmWalletModal';
import { type FC, useCallback, useState, useMemo, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { type Hex, formatUnits, isAddress, keccak256, toHex } from 'viem';
import { twMerge } from 'tailwind-merge';
import type {
  InjectedAccountWithMeta,
  InjectedExtension,
} from '@polkadot/extension-inject/types';
import { AnimatePresence, motion } from 'framer-motion';
import parseTransactionError from '@tangle-network/tangle-shared-ui/utils/parseTransactionError';
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

  // State
  const [substrateAccount, setSubstrateAccount] =
    useState<InjectedAccountWithMeta | null>(null);
  const [substrateExtension, setSubstrateExtension] =
    useState<InjectedExtension | null>(null);
  const [signature, setSignature] = useState<Hex | null>(null);
  const [currentStep, setCurrentStep] = useState<ClaimStep>(
    ClaimStep.CONNECT_WALLETS,
  );
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [signatureCopied, setSignatureCopied] = useState(false);

  // Sync recipient address with connected wallet when it changes
  useEffect(() => {
    if (evmAddress && !recipientAddress) {
      setRecipientAddress(evmAddress);
    }
  }, [evmAddress, recipientAddress]);

  useEffect(() => {
    if (!signatureCopied) {
      return;
    }
    const timeout = setTimeout(() => setSignatureCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [signatureCopied]);

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
    switchedToWalletMode,
  } = useSubmitClaim();

  // Validate recipient address
  const isRecipientValid = useMemo(() => {
    return recipientAddress && isAddress(recipientAddress);
  }, [recipientAddress]);

  const validRecipient = useMemo((): Hex | null => {
    if (!isRecipientValid) return null;
    return recipientAddress as Hex;
  }, [recipientAddress, isRecipientValid]);

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
  // Core requirements: eligibility loaded, user is eligible, hasn't claimed, has valid recipient, and extension ready
  const canSign = useMemo(() => {
    return (
      substrateAccount &&
      substrateExtension &&
      !isLoadingEligibility &&
      eligibility.isEligible &&
      !eligibility.hasClaimed &&
      !eligibility.isPaused &&
      validRecipient
    );
  }, [substrateAccount, substrateExtension, isLoadingEligibility, eligibility, validRecipient]);

  // Handle signing the challenge
  const handleSignChallenge = useCallback(async () => {
    if (!substrateAccount || !substrateExtension) {
      return;
    }

    setCurrentStep(ClaimStep.SIGN_CHALLENGE);

    try {
      // In dev mode without contract, use a mock challenge
      const challengeToSign =
        challenge || keccak256(toHex('dev-mode-challenge'));

      if (!substrateExtension.signer?.signRaw) {
        throw new Error('Signer does not support raw signing');
      }

      const result = await substrateExtension.signer.signRaw({
        address: substrateAccount.address,
        data: challengeToSign,
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
  }, [challenge, substrateAccount, substrateExtension]);

  const handleCopySignature = useCallback(() => {
    if (
      !signature ||
      typeof navigator === 'undefined' ||
      !navigator.clipboard
    ) {
      return;
    }

    navigator.clipboard
      .writeText(signature)
      .then(() => setSignatureCopied(true))
      .catch((err) => console.error('Failed to copy signature', err));
  }, [signature]);

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
      !validRecipient ||
      !eligibility.pubkey
    ) {
      return;
    }

    try {
      await submitClaim({
        ss58Address: substrateAccount.address,
        pubkey: eligibility.pubkey,
        amount: eligibility.amount,
        merkleProof: eligibility.merkleProof,
        zkProof: proof.zkProof,
        recipient: validRecipient,
      });
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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <Card withShadow className="w-full max-w-md p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
            >
              <CheckboxCircleFill className="w-12 h-12 text-white" />
            </motion.div>
            <Typography
              variant="h4"
              fw="bold"
              className="mb-2 text-mono-200 dark:text-mono-0"
            >
              Claim Successful!
            </Typography>
            <Typography variant="body1" className="text-mono-100 mb-4">
              Your TNT tokens have been claimed successfully.
            </Typography>
            <div className="p-3 rounded-lg bg-mono-20 dark:bg-mono-170 break-all flex items-center gap-2">
              <Typography
                variant="body2"
                className="font-mono text-xs text-mono-100"
              >
                {txHash}
              </Typography>

              {txHash && (
                <CopyWithTooltip textToCopy={txHash} isButton={false} />
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid items-start justify-center gap-6 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <div className="w-full max-w-lg">
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center md:text-left"
        >
          <Typography
            variant="h3"
            fw="bold"
            className="text-mono-200 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 dark:bg-clip-text dark:text-transparent"
          >
            Claim your TNT!
          </Typography>
          <Typography variant="body1" className="text-mono-100 mt-2">
            Migrate your Substrate balance to the new EVM chain
          </Typography>
        </motion.div>

        <Card withShadow className="relative w-full p-6 md:p-8">
          {/* Info button for How it works */}
          {!isHowItWorksOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  className="absolute top-4 -right-14 max-md:hidden"
                  onClick={() => setIsHowItWorksOpen(true)}
                >
                  <InformationLine className="w-5 h-5" />
                </IconButton>
              </TooltipTrigger>
              <TooltipBody>How it works</TooltipBody>
            </Tooltip>
          )}

          <div className="space-y-6">
            {/* Dev mode banner - always visible when contract not configured */}
            {!contractConfigured && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Typography
                  variant="body2"
                  className="text-blue-400 text-center"
                >
                  <span className="font-semibold">Dev Mode:</span> Contract not
                  deployed. Using mock data for UI testing.
                </Typography>
              </div>
            )}

            {/* Status alerts */}
            <AnimatePresence>
              {eligibility.hasClaimed && (
                <motion.div
                  key="claimed"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                >
                  <Typography
                    variant="body2"
                    className="text-yellow-400 text-center"
                  >
                    This address has already claimed its allocation.
                  </Typography>
                  {eligibility.claimedAmount > BigInt(0) && (
                    <Typography
                      variant="body2"
                      className="text-yellow-400/70 text-center mt-1"
                    >
                      Claimed:{' '}
                      {Number(
                        formatUnits(eligibility.claimedAmount, 18),
                      ).toLocaleString()}{' '}
                      TNT
                    </Typography>
                  )}
                </motion.div>
              )}

              {eligibility.isPaused && (
                <motion.div
                  key="paused"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                >
                  <Typography
                    variant="body2"
                    className="text-yellow-400 text-center"
                  >
                    Claims are currently paused.
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: EVM Wallet & Receiving Address */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={twMerge(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    isConnected
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                      : 'bg-mono-40 dark:bg-mono-160 text-mono-100',
                  )}
                >
                  1
                </div>
                <Typography
                  variant="body1"
                  fw="bold"
                  className="text-mono-200 dark:text-mono-0"
                >
                  Receiving Address
                </Typography>
              </div>

              {!isConnected ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className={twMerge(
                    'w-full flex items-center gap-3 px-4 py-4 rounded-xl',
                    'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
                    'border border-blue-500/30 hover:border-blue-500/50',
                    'transition-all duration-200 group',
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <Typography
                      variant="body1"
                      fw="semibold"
                      className="text-mono-200 dark:text-mono-0"
                    >
                      Connect EVM Wallet
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-mono-100 text-xs"
                    >
                      MetaMask, Rainbow, or any EVM wallet
                    </Typography>
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  {isEditingRecipient ? (
                    <div className="space-y-2">
                      <Input
                        id="recipient"
                        value={recipientAddress}
                        onChange={setRecipientAddress}
                        placeholder="0x..."
                        isInvalid={
                          recipientAddress.length > 0 && !isRecipientValid
                        }
                        errorMessage={
                          recipientAddress.length > 0 && !isRecipientValid
                            ? 'Invalid EVM address'
                            : undefined
                        }
                        inputClassName="font-mono text-sm"
                        isControlled
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setRecipientAddress(evmAddress || '');
                            setIsEditingRecipient(false);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsEditingRecipient(false)}
                          isDisabled={!isRecipientValid}
                          className="flex-1"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingRecipient(true)}
                      disabled={currentStep >= ClaimStep.SIGN_CHALLENGE}
                      className={twMerge(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                        'bg-mono-200/5 dark:bg-mono-0/5 border border-mono-200/10 dark:border-mono-0/10',
                        'hover:bg-mono-200/10 dark:hover:bg-mono-0/10 transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckboxCircleFill className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <Typography
                          variant="body2"
                          className="text-mono-100 text-xs"
                        >
                          TNT will be sent to
                        </Typography>
                        <Typography
                          variant="body2"
                          fw="medium"
                          className="text-mono-200 dark:text-mono-0 font-mono truncate"
                        >
                          {recipientAddress.slice(0, 10)}...
                          {recipientAddress.slice(-8)}
                        </Typography>
                      </div>
                      {currentStep < ClaimStep.SIGN_CHALLENGE && (
                        <EditLine className="w-4 h-4 text-mono-100" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Polkadot Wallet */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={twMerge(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      substrateAccount
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                        : 'bg-mono-40 dark:bg-mono-160 text-mono-100',
                    )}
                  >
                    2
                  </div>
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="text-mono-200 dark:text-mono-0"
                  >
                    Source Account
                  </Typography>
                </div>

                <SubstrateWalletSelector
                  selectedAccount={substrateAccount}
                  onAccountSelect={handleAccountSelect}
                  onExtensionChange={setSubstrateExtension}
                  disabled={currentStep >= ClaimStep.SIGN_CHALLENGE}
                />
              </motion.div>
            )}

            {signature && (
              <div className="p-4 rounded-xl border border-mono-60 dark:border-mono-140 bg-mono-20/40 dark:bg-mono-180/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Typography
                    variant="body2"
                    fw="semibold"
                    className="text-mono-120 dark:text-mono-40"
                  >
                    Signature
                  </Typography>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopySignature}
                  >
                    {signatureCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <Typography
                  variant="body2"
                  className="font-mono text-xs break-all text-mono-200 dark:text-mono-10"
                >
                  {signature}
                </Typography>
              </div>
            )}

            {/* Eligibility Check */}
            <AnimatePresence mode="wait">
              {substrateAccount && isLoadingEligibility && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-blue-500/20" />
                      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <Typography
                        variant="body1"
                        fw="semibold"
                        className="text-mono-200 dark:text-mono-0"
                      >
                        Checking Eligibility
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-mono-100 mt-1"
                      >
                        Verifying your allocation in the merkle tree...
                      </Typography>
                    </div>
                  </div>
                </motion.div>
              )}

              {substrateAccount &&
                !isLoadingEligibility &&
                !eligibility.hasClaimed &&
                eligibility.isEligible && (
                  <motion.div
                    key="eligible"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
                  >
                    <div className="text-center">
                      <Typography
                        variant="body2"
                        className="text-green-400 mb-2"
                      >
                        You are eligible to claim
                      </Typography>
                      <Typography
                        variant="h3"
                        fw="bold"
                        className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                      >
                        {Number(formattedAmount).toLocaleString()} TNT
                      </Typography>
                      {eligibility.timeRemaining > BigInt(0) && (
                        <Typography
                          variant="body2"
                          className="text-mono-100 mt-2"
                        >
                          {Math.floor(
                            Number(eligibility.timeRemaining) / 86400,
                          )}{' '}
                          days remaining to claim
                        </Typography>
                      )}
                    </div>
                  </motion.div>
                )}

              {substrateAccount &&
                !isLoadingEligibility &&
                !eligibility.hasClaimed &&
                !eligibility.isEligible && (
                  <motion.div
                    key="not-eligible"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <div className="text-center">
                      <Typography
                        variant="body1"
                        fw="semibold"
                        className="text-red-400"
                      >
                        Not Eligible
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-mono-100 mt-2"
                      >
                        This Polkadot account is not eligible for the migration
                        claim. Try connecting a different account.
                      </Typography>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <AnimatePresence mode="wait">
              {canSign && currentStep === ClaimStep.CHECK_ELIGIBILITY && (
                <motion.div
                  key="sign"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button isFullWidth onClick={handleSignChallenge}>
                    Sign Ownership Proof
                  </Button>
                </motion.div>
              )}

              {signature && currentStep === ClaimStep.GENERATE_PROOF && (
                <motion.div
                  key="proof"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {proofProgress && (
                    <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-blue-0 dark:bg-blue-120">
                      <Typography variant="body2" className="text-blue-50">
                        {proofProgress}
                      </Typography>
                    </div>
                  )}
                  {proofError && (
                    <Typography
                      variant="body2"
                      className="text-red-70 dark:text-red-50 text-center"
                    >
                      {proofError}
                    </Typography>
                  )}
                  <Button
                    isFullWidth
                    onClick={handleGenerateProof}
                    isLoading={isGenerating}
                    loadingText="Generating ZK Proof..."
                  >
                    Generate ZK Proof
                  </Button>
                </motion.div>
              )}

              {proof && currentStep === ClaimStep.SUBMIT_CLAIM && (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {switchedToWalletMode && (
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-start gap-3">
                        <Alert className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <Typography
                            variant="body2"
                            fw="semibold"
                            className="text-orange-400"
                          >
                            Wallet Mode Active
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-orange-400/80 mt-1"
                          >
                            The relayer is unavailable. You will pay gas fees
                            directly from your wallet.
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start gap-3">
                        <Alert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <Typography
                            variant="body2"
                            fw="semibold"
                            className="text-red-400"
                          >
                            Transaction Failed
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-red-400/80 mt-1"
                          >
                            {parseTransactionError(submitError)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    isFullWidth
                    onClick={handleSubmitClaim}
                    isLoading={isSubmitting || isConfirming}
                    loadingText={
                      isConfirming ? 'Confirming...' : 'Submitting...'
                    }
                  >
                    {switchedToWalletMode
                      ? `Claim ${Number(formattedAmount).toLocaleString()} TNT (Pay Gas)`
                      : `Claim ${Number(formattedAmount).toLocaleString()} TNT`}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* How it works - Horizontal expansion */}
      <AnimatePresence>
        {isHowItWorksOpen && (
          <motion.div
            key="how-it-works-panel"
            className="w-80 origin-left hidden md:block"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
          >
            <Card withShadow className="p-6">
              <div className="flex items-center justify-between mb-5">
                <Typography
                  variant="h5"
                  fw="bold"
                  className="text-mono-200 dark:text-mono-0"
                >
                  How it works
                </Typography>
                <button
                  onClick={() => setIsHowItWorksOpen(false)}
                  className="w-8 h-8 rounded-full bg-mono-40 dark:bg-mono-160 hover:bg-mono-60 dark:hover:bg-mono-140 flex items-center justify-center transition-colors"
                >
                  <span className="text-mono-100 text-sm">✕</span>
                </button>
              </div>

              <ol className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Connect EVM Wallet',
                    desc: 'Choose where to receive your TNT',
                  },
                  {
                    step: 2,
                    title: 'Connect Polkadot',
                    desc: 'Select your eligible account',
                  },
                  {
                    step: 3,
                    title: 'Sign Proof',
                    desc: 'Prove you own the private key',
                  },
                  {
                    step: 4,
                    title: 'Generate ZK Proof',
                    desc: 'Create verifiable proof on-chain',
                  },
                  {
                    step: 5,
                    title: 'Claim TNT',
                    desc: 'Receive your tokens',
                  },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <Typography
                        variant="body2"
                        fw="semibold"
                        className="text-mono-200 dark:text-mono-0"
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-mono-100 text-xs"
                      >
                        {desc}
                      </Typography>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-5 p-3 rounded-xl bg-mono-20 dark:bg-mono-170">
                <Typography variant="body2" className="text-mono-100 text-xs">
                  You have 1 year from migration start to claim. Unclaimed
                  tokens return to treasury.
                </Typography>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <EvmWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};

export default MigrationClaimPage;
