import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '../../../../../components/sandbox/SandboxUi';
import { Children, FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { PaymentStepProps } from './type';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import {
  useStakingAssets,
  type StakingAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useShieldedContext } from '../../../../../app/ShieldedProvider';
import { useCreditsContext } from '../../../../../app/CreditsProvider';
import { SHIELDED_CREDITS_ADDRESS } from '../../../../../constants/payments';
import { ERC20_ABI, SHIELDED_CREDITS_ABI } from '../../../../../abi/payments';

export const PaymentStep: FC<PaymentStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const { address } = useAccount();
  const { assets } = useStakingAssets();
  const {
    deriveKeypair,
    unlockKeypair,
    hasStoredKeypair,
    isDerivingKeypair,
    keypair,
  } = useShieldedContext();
  const {
    creditAccounts,
    generateAndStoreCreditKeys,
    isUnlocked,
    isLoading: isLoadingCredits,
  } = useCreditsContext();
  const [isCreatingCreditAccount, setIsCreatingCreditAccount] = useState(false);
  const [isFundingCredits, setIsFundingCredits] = useState(false);
  const [fundingAssetId, setFundingAssetId] = useState<`0x${string}` | ''>('');
  const [fundingAmount, setFundingAmount] = useState('10');
  const [fundingTxHash, setFundingTxHash] = useState<`0x${string}` | null>(
    null,
  );
  const [creditError, setCreditError] = useState<string | null>(null);
  const paymentMethod = watch('paymentMethod') ?? 'shieldedCredits';
  const selectedCommitment = watch('creditCommitment');
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const selectableAssets = (
    Array.from(assets?.values() ?? []) as StakingAsset[]
  ).filter((asset) => asset.metadata.name && asset.metadata.name.trim() !== '');

  useEffect(() => {
    if (paymentMethod !== 'shieldedCredits') {
      return;
    }

    if (!selectedCommitment && creditAccounts[0]?.commitment) {
      queueMicrotask(() => {
        setValue('creditCommitment', creditAccounts[0].commitment, {
          shouldDirty: false,
        });
      });
    }
  }, [creditAccounts, paymentMethod, selectedCommitment, setValue]);

  useEffect(() => {
    if (!fundingAssetId && selectableAssets[0]?.id) {
      queueMicrotask(() => {
        setFundingAssetId(selectableAssets[0].id);
      });
    }
  }, [fundingAssetId, selectableAssets]);

  const onSelectAsset = (asset: StakingAsset) => {
    setValue('paymentAsset', {
      id: asset.id,
      metadata: {
        name: asset.metadata.name,
        symbol: asset.metadata.symbol,
        decimals: asset.metadata.decimals,
        priceInUsd: null,
      },
    });
  };

  const onChangePaymentAmount = (nextValue: string) => {
    setValue('paymentAmount', nextValue);
  };

  const unlockOrCreateShieldedKey = async () => {
    setCreditError(null);
    try {
      await (hasStoredKeypair ? unlockKeypair() : deriveKeypair());
    } catch (error) {
      setCreditError(
        error instanceof Error
          ? error.message
          : 'Failed to unlock shielded key',
      );
    }
  };

  const createCreditAccount = async () => {
    setIsCreatingCreditAccount(true);
    setCreditError(null);

    try {
      const account = await generateAndStoreCreditKeys(
        `Blueprint checkout ${creditAccounts.length + 1}`,
      );
      setValue('creditCommitment', account.commitment, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setCreditError(
        error instanceof Error
          ? error.message
          : 'Failed to create credit account',
      );
    } finally {
      setIsCreatingCreditAccount(false);
    }
  };

  const fundCreditAccount = async () => {
    if (
      !selectedCreditAccount ||
      !fundingAssetId ||
      !SHIELDED_CREDITS_ADDRESS ||
      !publicClient
    ) {
      return;
    }

    const asset = assets?.get(fundingAssetId);
    if (!asset) {
      setCreditError('Select a funding asset');
      return;
    }

    setIsFundingCredits(true);
    setFundingTxHash(null);
    setCreditError(null);

    try {
      const amount = parseUnits(
        fundingAmount || '0',
        asset.metadata.decimals ?? 18,
      );

      if (amount <= 0n) {
        throw new Error('Funding amount must be greater than zero');
      }

      const approveHash = await writeContractAsync({
        address: fundingAssetId,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SHIELDED_CREDITS_ADDRESS as Address, amount],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      const fundHash = await writeContractAsync({
        address: SHIELDED_CREDITS_ADDRESS as Address,
        abi: SHIELDED_CREDITS_ABI,
        functionName: 'fundCredits',
        args: [
          fundingAssetId,
          amount,
          selectedCreditAccount.commitment as `0x${string}`,
          selectedCreditAccount.spendingPublicKey as Address,
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash: fundHash });
      setFundingTxHash(fundHash);
    } catch (error) {
      setCreditError(
        error instanceof Error ? error.message : 'Failed to fund credits',
      );
    } finally {
      setIsFundingCredits(false);
    }
  };

  const selectedPaymentAssetId = watch('paymentAsset')?.id;
  const selectedCreditAccount = creditAccounts.find(
    (account) => account.commitment === selectedCommitment,
  );

  return (
    <Card className="overflow-hidden border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Text variant="h5">Checkout</Text>
            <Text
              variant="body2"
              className="mt-1 text-mono-100 dark:text-mono-60"
            >
              Choose how this service instance will be funded and verified.
            </Text>
          </div>

          <Badge
            variant={
              paymentMethod === 'shieldedCredits' ? 'success' : 'outline'
            }
          >
            {paymentMethod === 'shieldedCredits'
              ? 'Private credit path'
              : 'Public wallet path'}
          </Badge>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <PaymentMethodCard
            isActive={paymentMethod === 'shieldedCredits'}
            title="Shielded credits"
            description="Use a credit commitment and ephemeral spending key. The wallet unlocks keys locally; operators verify spend authorizations."
            facts={[
              'Credit commitment',
              'Ephemeral signer',
              'Verifiable nonce',
            ]}
            onClick={() =>
              setValue('paymentMethod', 'shieldedCredits', {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />

          <PaymentMethodCard
            isActive={paymentMethod === 'publicWallet'}
            title="Public wallet"
            description="Use the standard service request payment fields. Payment token and amount are visible in the service request."
            facts={['Payment token', 'Amount', 'Wallet transaction']}
            onClick={() =>
              setValue('paymentMethod', 'publicWallet', {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>

        {paymentMethod === 'shieldedCredits' ? (
          <div className="space-y-4 rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <TrustCell
                label="Private"
                value="Wallet link stays local"
                detail="The credit account is represented by a commitment."
              />
              <TrustCell
                label="Spend"
                value="Signed by credit key"
                detail="Operators verify the authorization and nonce."
              />
              <TrustCell
                label="Public"
                value="Blueprint/order only"
                detail="Service request still records blueprint, operators, and TTL."
              />
            </div>

            {!address ? (
              <Alert description="Connect a wallet to unlock shielded keys and create credit accounts." />
            ) : !keypair || !isUnlocked ? (
              <div className="flex flex-col gap-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Text variant="body1" fw="semibold">
                    Unlock shielded account
                  </Text>
                  <Text
                    variant="body3"
                    className="mt-1 text-mono-100 dark:text-mono-60"
                  >
                    Sign once. The derived key is encrypted locally and never
                    sent to a server.
                  </Text>
                </div>
                <Button
                  onClick={unlockOrCreateShieldedKey}
                  isLoading={isDerivingKeypair}
                >
                  {hasStoredKeypair ? 'Unlock' : 'Create key'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="space-y-2">
                  <Text variant="body1">Credit account</Text>
                  <Select
                    value={selectedCommitment}
                    onValueChange={(commitment: string) =>
                      setValue('creditCommitment', commitment, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          isLoadingCredits
                            ? 'Loading credit accounts...'
                            : 'Select credit account'
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {Children.toArray(
                        creditAccounts.map((account) => (
                          <SelectItem
                            value={account.commitment}
                            id={account.commitment}
                          >
                            <span className="font-mono text-xs">
                              {account.label ??
                                `${account.commitment.slice(0, 10)}...${account.commitment.slice(-6)}`}
                            </span>
                          </SelectItem>
                        )),
                      )}
                    </SelectContent>
                  </Select>
                  {errors?.creditCommitment?.message && (
                    <ErrorMessage className="mt-1">
                      {errors.creditCommitment.message}
                    </ErrorMessage>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={createCreditAccount}
                  isLoading={isCreatingCreditAccount}
                >
                  Create credit account
                </Button>
              </div>
            )}

            {selectedCreditAccount && (
              <div className="space-y-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190/40 p-3">
                <div>
                  <Text
                    variant="body3"
                    className="text-mono-100 dark:text-mono-60"
                  >
                    Selected commitment
                  </Text>
                  <p className="mt-1 break-all font-mono text-mono-200 dark:text-mono-0 text-xs">
                    {selectedCreditAccount.commitment}
                  </p>
                </div>

                {SHIELDED_CREDITS_ADDRESS && (
                  <div className="grid gap-3 md:grid-cols-[1fr_160px_auto] md:items-end">
                    <div className="space-y-2">
                      <Text
                        variant="body3"
                        className="text-mono-100 dark:text-mono-60"
                      >
                        Funding asset
                      </Text>
                      <Select
                        value={fundingAssetId}
                        onValueChange={(assetId: string) =>
                          setFundingAssetId(assetId as `0x${string}`)
                        }
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {Children.toArray(
                            selectableAssets.map((asset) => (
                              <SelectItem value={asset.id} id={asset.id}>
                                {asset.metadata.symbol ?? asset.metadata.name}
                              </SelectItem>
                            )),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Text
                        variant="body3"
                        className="text-mono-100 dark:text-mono-60"
                      >
                        Amount
                      </Text>
                      <Input
                        isControlled
                        value={fundingAmount}
                        onChange={setFundingAmount}
                        inputClassName="h-10"
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={fundCreditAccount}
                      isLoading={isFundingCredits}
                    >
                      Fund credits
                    </Button>
                  </div>
                )}

                {fundingTxHash && (
                  <Alert type="success" title="Credit account funded">
                    <p className="break-all font-mono text-xs">
                      {fundingTxHash}
                    </p>
                  </Alert>
                )}
              </div>
            )}

            <Alert
              type={SHIELDED_CREDITS_ADDRESS ? 'success' : 'warning'}
              title={
                SHIELDED_CREDITS_ADDRESS
                  ? 'Credits contract configured'
                  : 'Settlement contract not configured'
              }
              description={
                SHIELDED_CREDITS_ADDRESS
                  ? 'This checkout can read on-chain credit account state and produce verifiable spend authorizations.'
                  : 'This build can demonstrate local credit commitments and key flow. Set VITE_SHIELDED_CREDITS_ADDRESS to settle credits on-chain.'
              }
            />

            {creditError && <Alert type="error" description={creditError} />}
          </div>
        ) : (
          <div className="grid gap-6 rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Text variant="body1">Payment asset</Text>
              <Select
                value={selectedPaymentAssetId}
                onValueChange={(assetId: string) => {
                  const asset = assets?.get(assetId as `0x${string}`) as
                    | StakingAsset
                    | undefined;
                  if (asset) {
                    onSelectAsset(asset);
                  }
                }}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select payment asset" />
                </SelectTrigger>

                <SelectContent>
                  {Children.toArray(
                    selectableAssets.map((asset) => {
                      const name = asset.metadata.name || 'Unknown';
                      const symbol = asset.metadata.symbol || 'TNT';
                      return (
                        <SelectItem value={asset.id} id={asset.id}>
                          <div className="flex items-center gap-2">
                            <LsTokenIcon name={symbol} size="md" />
                            <Text variant="body1">{name}</Text>
                          </div>
                        </SelectItem>
                      );
                    }),
                  )}
                </SelectContent>
              </Select>
              {errors?.paymentAsset?.message && (
                <ErrorMessage className="mt-1">
                  {errors.paymentAsset.message}
                </ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <Text variant="body1">Payment amount</Text>
              <Input
                isControlled
                id="paymentAmount"
                placeholder="Enter payment amount"
                value={watch('paymentAmount')?.toString() ?? ''}
                onChange={onChangePaymentAmount}
                type="text"
                inputClassName="h-11"
                className="w-full"
              />
              {errors?.paymentAmount?.message && (
                <ErrorMessage className="mt-1">
                  {errors.paymentAmount.message}
                </ErrorMessage>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PaymentMethodCard = ({
  isActive,
  title,
  description,
  facts,
  onClick,
}: {
  isActive: boolean;
  title: string;
  description: string;
  facts: string[];
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={twMerge(
      'rounded-xl border p-4 text-left transition-colors',
      isActive
        ? 'border-[var(--border-accent-hover)] bg-[var(--bg-selection)]'
        : 'border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 hover:border-[var(--border-hover)] hover:bg-mono-20 dark:hover:bg-mono-190/50',
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <Text variant="body1" fw="semibold">
        {title}
      </Text>
      <span
        className={twMerge(
          'h-3 w-3 rounded-full border',
          isActive
            ? 'border-purple-40 bg-purple-40'
            : 'border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190',
        )}
      />
    </div>
    <Text variant="body3" className="mt-2 text-mono-100 dark:text-mono-60">
      {description}
    </Text>
    <div className="mt-4 flex flex-wrap gap-2">
      {facts.map((fact) => (
        <span
          key={fact}
          className="rounded-full border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190/50 px-2 py-1 text-mono-100 dark:text-mono-60 text-xs"
        >
          {fact}
        </span>
      ))}
    </div>
  </button>
);

const TrustCell = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) => (
  <div className="rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/70 p-3">
    <p className="font-medium text-mono-100 dark:text-mono-60 text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 font-display font-bold text-mono-200 dark:text-mono-0 text-sm">
      {value}
    </p>
    <p className="mt-1 text-mono-100 dark:text-mono-60 text-xs">{detail}</p>
  </div>
);
