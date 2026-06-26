/**
 * Modal for funding a service's escrow balance.
 */

import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  type ReactNode,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  Button as SandboxButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input as SandboxInput,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import {
  useServiceEscrow,
  useTokenMetadata,
  useFundServiceTx,
} from '@tangle-network/tangle-shared-ui/data/services';
import useErc20Approval from '@tangle-network/tangle-shared-ui/hooks/useErc20Approval';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';

interface Props {
  serviceId: bigint;
  onClose: () => void;
}

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  />
);

type InputProps = Omit<ComponentProps<typeof SandboxInput>, 'onChange'> & {
  isControlled?: boolean;
  isInvalid?: boolean;
  rightIcon?: ReactNode;
  onChange?: (value: string) => void;
};

const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  isInvalid,
  rightIcon,
  className = '',
  onChange,
  ...props
}) => (
  <div className={['relative', className].filter(Boolean).join(' ')}>
    <SandboxInput
      {...props}
      className={[
        rightIcon ? 'pr-20' : '',
        isInvalid ? 'border-destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange?.(event.currentTarget.value)
      }
    />
    {rightIcon && (
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {rightIcon}
      </div>
    )}
  </div>
);

const Modal = Dialog;

const ModalContent: FC<
  ComponentProps<typeof DialogContent> & { size?: string }
> = ({ size: _size, ...props }) => <DialogContent {...props} />;

const ModalHeader: FC<ComponentProps<'div'>> = ({ children, ...props }) => (
  <DialogHeader {...props}>
    <DialogTitle>{children}</DialogTitle>
  </DialogHeader>
);

const ModalBody: FC<ComponentProps<'div'>> = ({ className = '', ...props }) => (
  <div
    className={['space-y-4', className].filter(Boolean).join(' ')}
    {...props}
  />
);

const ModalFooter = DialogFooter;

const FundServiceModal: FC<Props> = ({ serviceId, onClose }) => {
  const [amountInput, setAmountInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  const { data: escrow, isLoading: isLoadingEscrow } =
    useServiceEscrow(serviceId);
  const { data: tokenMetadata, isLoading: isLoadingToken } = useTokenMetadata(
    escrow?.token,
  );

  const isLoading = isLoadingEscrow || isLoadingToken;
  const isNativeToken = escrow?.isNativeToken ?? true;
  const tokenSymbol =
    tokenMetadata?.symbol ?? (isNativeToken ? 'ETH' : 'TOKEN');
  const tokenDecimals = tokenMetadata?.decimals ?? 18;

  // Parse input amount to bigint
  const parsedAmount = useMemo(() => {
    if (!amountInput || amountInput.trim() === '') return BigInt(0);
    try {
      return parseUnits(amountInput, tokenDecimals);
    } catch {
      return BigInt(0);
    }
  }, [amountInput, tokenDecimals]);

  // Get user's native token balance
  const { data: nativeBalance } = useBalance({
    address,
    query: { enabled: !!address && isNativeToken },
  });

  // Get user's ERC20 token balance
  const { data: tokenBalance } = useBalance({
    address,
    token: !isNativeToken && escrow?.token ? escrow.token : undefined,
    query: { enabled: !!address && !isNativeToken && !!escrow?.token },
  });

  const userBalance = isNativeToken ? nativeBalance : tokenBalance;

  // ERC20 approval handling
  const {
    needsApproval,
    approve,
    isPending: isApproving,
    isSuccess: approvalSuccess,
    refetchAllowance,
  } = useErc20Approval({
    token: !isNativeToken && escrow?.token ? escrow.token : undefined,
    spender: contracts?.tangle,
    amount: parsedAmount,
    owner: address,
    enabled: !isNativeToken && !!escrow?.token,
  });

  // Fund service transaction
  const {
    execute: executeFund,
    isPending: isFunding,
    isSuccess: fundSuccess,
    error: fundError,
    reset: resetFund,
  } = useFundServiceTx({
    onSuccess: () => {
      onClose();
    },
  });

  // Refetch allowance after approval success
  useEffect(() => {
    if (approvalSuccess) {
      refetchAllowance();
    }
  }, [approvalSuccess, refetchAllowance]);

  // Validation
  const validateAmount = useCallback(() => {
    setValidationError(null);

    if (!amountInput || amountInput.trim() === '') {
      setValidationError('Please enter an amount');
      return false;
    }

    if (parsedAmount <= BigInt(0)) {
      setValidationError('Amount must be greater than 0');
      return false;
    }

    if (userBalance && parsedAmount > userBalance.value) {
      setValidationError('Insufficient balance');
      return false;
    }

    return true;
  }, [amountInput, parsedAmount, userBalance]);

  const handleFund = useCallback(async () => {
    if (!validateAmount() || !executeFund) return;

    await executeFund({
      serviceId,
      amount: parsedAmount,
      isNativeToken,
      tokenDecimals,
      tokenSymbol,
    });
  }, [
    validateAmount,
    executeFund,
    serviceId,
    parsedAmount,
    isNativeToken,
    tokenDecimals,
    tokenSymbol,
  ]);

  const handleMaxClick = useCallback(() => {
    if (userBalance) {
      setAmountInput(formatUnits(userBalance.value, tokenDecimals));
      setValidationError(null);
    }
  }, [userBalance, tokenDecimals]);

  const formatAmount = (amount: bigint | undefined): string => {
    if (amount === undefined) return '0';
    const formatted = parseFloat(formatUnits(amount, tokenDecimals));
    return formatted.toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  };

  const insufficientBalance =
    userBalance && parsedAmount > BigInt(0) && parsedAmount > userBalance.value;

  const requiresApproval =
    !isNativeToken &&
    needsApproval &&
    !approvalSuccess &&
    parsedAmount > BigInt(0);

  const canFund =
    parsedAmount > BigInt(0) &&
    !insufficientBalance &&
    !requiresApproval &&
    !isFunding;

  return (
    <Modal open onOpenChange={(open: boolean) => !open && onClose()}>
      <ModalContent size="md">
        <ModalHeader>Fund Service #{serviceId.toString()}</ModalHeader>

        <ModalBody>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Escrow Balance */}
              <div className="p-4 rounded-lg bg-mono-20/50 dark:bg-mono-190/50">
                <Text
                  variant="body2"
                  className="text-mono-100 dark:text-mono-60 mb-1"
                >
                  Current Escrow Balance
                </Text>
                <Text variant="h5" fw="bold" className="text-green-400">
                  {formatAmount(escrow?.balance)} {tokenSymbol}
                </Text>
              </div>

              {/* User Balance */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-mono-100 dark:text-mono-60">
                  Your Balance:
                </span>
                <span className="font-semibold">
                  {userBalance
                    ? `${formatAmount(userBalance.value)} ${tokenSymbol}`
                    : 'Loading...'}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text variant="body2">Amount to Fund</Text>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={handleMaxClick}
                    isDisabled={!userBalance}
                  >
                    MAX
                  </Button>
                </div>
                <Input
                  id="fund-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder={`0.0 ${tokenSymbol}`}
                  isControlled
                  value={amountInput}
                  onChange={(value) => {
                    setAmountInput(value);
                    setValidationError(null);
                    resetFund();
                  }}
                  isInvalid={!!validationError || !!insufficientBalance}
                  rightIcon={
                    <span className="text-mono-100 dark:text-mono-60">
                      {tokenSymbol}
                    </span>
                  }
                />
              </div>

              {/* Insufficient Balance Warning */}
              {insufficientBalance && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <Text variant="body2" className="text-red-400">
                    Insufficient balance. You need at least{' '}
                    {formatUnits(parsedAmount, tokenDecimals)} {tokenSymbol}.
                  </Text>
                </div>
              )}

              {/* ERC20 Approval Section */}
              {!isNativeToken &&
                needsApproval &&
                !approvalSuccess &&
                parsedAmount > BigInt(0) && (
                  <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <Text variant="body2" className="text-yellow-400 mb-2">
                      You need to approve the contract to spend your tokens
                      before funding.
                    </Text>
                    <Button
                      onClick={approve}
                      isLoading={isApproving}
                      isDisabled={isApproving}
                      variant="secondary"
                      size="sm"
                    >
                      {isApproving ? 'Approving...' : `Approve ${tokenSymbol}`}
                    </Button>
                  </div>
                )}

              {/* Approval Success */}
              {!isNativeToken && approvalSuccess && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                  <Text variant="body2" className="text-green-400">
                    Token approved! You can now fund the service.
                  </Text>
                </div>
              )}

              {/* Validation Error */}
              {validationError && (
                <ErrorMessage>{validationError}</ErrorMessage>
              )}

              {/* Transaction Error */}
              {fundError && <ErrorMessage>{fundError.message}</ErrorMessage>}

              {/* Success Message */}
              {fundSuccess && (
                <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                  <Text variant="body2">Service funded successfully!</Text>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleFund}
            isLoading={isFunding}
            isDisabled={!canFund}
          >
            {isFunding
              ? 'Funding...'
              : insufficientBalance
                ? 'Insufficient Balance'
                : requiresApproval
                  ? 'Approval Required'
                  : 'Fund'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FundServiceModal;
