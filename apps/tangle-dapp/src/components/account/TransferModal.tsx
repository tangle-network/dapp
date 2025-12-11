import { FC, useCallback, useMemo, useState } from 'react';
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useWalletClient,
} from 'wagmi';
import { Address, erc20Abi, isAddress, parseUnits, formatUnits } from 'viem';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@tangle-network/ui-components/components/Modal';
import { Button } from '@tangle-network/ui-components/components/buttons/Button';
import { Input } from '@tangle-network/ui-components/components/Input';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { TokenIcon } from '@tangle-network/icons';
import {
  useRestakeAssets,
  type RestakeAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql/useRestakeAssets';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransferStatus = 'idle' | 'pending' | 'success' | 'error';

// Token option including native and ERC20
interface TokenOption {
  address: Address | 'native';
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
}

const TransferModal: FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Native balance
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address: userAddress,
  });

  // ERC20 assets
  const {
    assetList,
    isLoading: isLoadingAssets,
    refetchBalances,
  } = useRestakeAssets();

  // Form state
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Build token options list
  const tokenOptions = useMemo<TokenOption[]>(() => {
    const options: TokenOption[] = [];

    // Add native token first
    if (nativeBalance) {
      options.push({
        address: 'native',
        symbol: nativeBalance.symbol,
        name: `${nativeBalance.symbol} (Native)`,
        decimals: nativeBalance.decimals,
        balance: nativeBalance.value,
      });
    }

    // Add ERC20 tokens from restaking assets
    for (const asset of assetList) {
      options.push({
        address: asset.id,
        symbol: asset.metadata.symbol,
        name: asset.metadata.name,
        decimals: asset.metadata.decimals,
        balance: asset.balance,
      });
    }

    return options;
  }, [nativeBalance, assetList]);

  // Set default token when options are available
  useMemo(() => {
    if (!selectedToken && tokenOptions.length > 0) {
      setSelectedToken(tokenOptions[0]);
    }
  }, [tokenOptions, selectedToken]);

  // Validate form
  const isValidRecipient = recipient && isAddress(recipient);
  const isValidAmount = useMemo(() => {
    if (!amount || !selectedToken) return false;
    try {
      const parsed = parseUnits(amount, selectedToken.decimals);
      return parsed > BigInt(0) && parsed <= selectedToken.balance;
    } catch {
      return false;
    }
  }, [amount, selectedToken]);

  const canSubmit =
    isValidRecipient &&
    isValidAmount &&
    status === 'idle' &&
    walletClient &&
    publicClient;

  // Format balance for display
  const formatBalance = (balance: bigint, decimals: number): string => {
    const formatted = formatUnits(balance, decimals);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  };

  // Set max amount
  const handleSetMax = useCallback(() => {
    if (!selectedToken) return;
    // For native token, leave some for gas
    if (selectedToken.address === 'native') {
      const gasBuffer = parseUnits('0.01', selectedToken.decimals);
      const maxAmount =
        selectedToken.balance > gasBuffer
          ? selectedToken.balance - gasBuffer
          : BigInt(0);
      setAmount(formatUnits(maxAmount, selectedToken.decimals));
    } else {
      setAmount(formatUnits(selectedToken.balance, selectedToken.decimals));
    }
  }, [selectedToken]);

  // Execute transfer
  const handleTransfer = useCallback(async () => {
    if (!canSubmit || !selectedToken || !walletClient || !publicClient) return;

    setStatus('pending');
    setError(null);
    setTxHash(null);

    try {
      const parsedAmount = parseUnits(amount, selectedToken.decimals);
      const recipientAddress = recipient as Address;

      let hash: `0x${string}`;

      if (selectedToken.address === 'native') {
        // Native token transfer
        hash = await walletClient.sendTransaction({
          to: recipientAddress,
          value: parsedAmount,
        });
      } else {
        // ERC20 transfer
        hash = await walletClient.writeContract({
          address: selectedToken.address,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipientAddress, parsedAmount],
        });
      }

      setTxHash(hash);

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });

      setStatus('success');

      // Refresh balances
      await Promise.all([refetchNativeBalance(), refetchBalances()]);

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Transfer failed:', err);
      setError(err instanceof Error ? err.message : 'Transfer failed');
      setStatus('error');
    }
  }, [
    canSubmit,
    selectedToken,
    walletClient,
    publicClient,
    amount,
    recipient,
    refetchNativeBalance,
    refetchBalances,
  ]);

  // Reset and close
  const handleClose = useCallback(() => {
    setSelectedToken(null);
    setRecipient('');
    setAmount('');
    setStatus('idle');
    setError(null);
    setTxHash(null);
    onClose();
  }, [onClose]);

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ModalContent size="md">
        <ModalHeader onClose={handleClose}>Send Tokens</ModalHeader>

        <ModalBody className="space-y-4">
          {/* Token Selection */}
          <div>
            <Typography variant="body2" className="mb-2 text-mono-100">
              Select Token
            </Typography>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {isLoadingAssets ? (
                <Typography variant="body2" className="text-mono-100 py-4 text-center">
                  Loading tokens...
                </Typography>
              ) : tokenOptions.length === 0 ? (
                <Typography variant="body2" className="text-mono-100 py-4 text-center">
                  No tokens available
                </Typography>
              ) : (
                tokenOptions.map((token) => (
                  <button
                    key={token.address}
                    type="button"
                    onClick={() => setSelectedToken(token)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedToken?.address === token.address
                        ? 'bg-blue-500/20 border border-blue-500'
                        : 'bg-mono-20 dark:bg-mono-170 hover:bg-mono-40 dark:hover:bg-mono-160'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TokenIcon name={token.symbol} size="md" />
                      <div className="text-left">
                        <Typography variant="body1" fw="bold">
                          {token.symbol}
                        </Typography>
                        <Typography variant="body2" className="text-mono-100">
                          {token.name}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="body2" className="text-mono-100">
                      {formatBalance(token.balance, token.decimals)}
                    </Typography>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recipient Address */}
          <div>
            <Typography variant="body2" className="mb-2 text-mono-100">
              Recipient Address
            </Typography>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              isInvalid={recipient.length > 0 && !isValidRecipient}
            />
            {recipient.length > 0 && !isValidRecipient && (
              <Typography variant="body2" className="text-red-500 mt-1">
                Invalid address
              </Typography>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body2" className="text-mono-100">
                Amount
              </Typography>
              {selectedToken && (
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  Max: {formatBalance(selectedToken.balance, selectedToken.decimals)}{' '}
                  {selectedToken.symbol}
                </button>
              )}
            </div>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => {
                // Only allow valid number input
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setAmount(val);
                }
              }}
              isInvalid={amount.length > 0 && !isValidAmount}
              rightElement={
                selectedToken ? (
                  <span className="text-mono-100">{selectedToken.symbol}</span>
                ) : undefined
              }
            />
            {amount.length > 0 && !isValidAmount && selectedToken && (
              <Typography variant="body2" className="text-red-500 mt-1">
                {parseFloat(amount) > parseFloat(formatUnits(selectedToken.balance, selectedToken.decimals))
                  ? 'Insufficient balance'
                  : 'Invalid amount'}
              </Typography>
            )}
          </div>

          {/* Status Messages */}
          {status === 'pending' && (
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500">
              <Typography variant="body2" className="text-blue-500">
                Transaction pending...
              </Typography>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500">
              <Typography variant="body2" className="text-green-500">
                Transfer successful!
              </Typography>
              {txHash && (
                <Typography variant="body2" className="text-mono-100 mt-1 break-all">
                  Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </Typography>
              )}
            </div>
          )}

          {status === 'error' && error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500">
              <Typography variant="body2" className="text-red-500">
                {error}
              </Typography>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            isDisabled={!canSubmit}
            isLoading={status === 'pending'}
            onClick={handleTransfer}
          >
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferModal;
