import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useBalance,
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
import { Button } from '@tangle-network/ui-components/components/buttons';
import { Input } from '@tangle-network/ui-components/components/Input';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { TokenIcon } from '@tangle-network/icons';
import TokenSelector from '@tangle-network/ui-components/components/TokenSelector';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakeAssets';

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
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Token selection modal
  const {
    status: isTokenModalOpen,
    open: openTokenModal,
    close: closeTokenModal,
    update: updateTokenModal,
  } = useModal();

  // Native balance
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address: userAddress,
    query: {
      enabled: Boolean(userAddress) && isOpen,
      refetchInterval: 10_000,
      refetchIntervalInBackground: true,
    },
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

  // Set default token and keep selectedToken in sync with balance updates
  useEffect(() => {
    if (tokenOptions.length === 0) return;

    if (!selectedToken) {
      // Set default token when first available
      setSelectedToken(tokenOptions[0]);
    } else {
      // Update selectedToken when balance changes in tokenOptions
      const updatedToken = tokenOptions.find(
        (t) => t.address === selectedToken.address,
      );
      if (updatedToken && updatedToken.balance !== selectedToken.balance) {
        setSelectedToken(updatedToken);
      }
    }
  }, [tokenOptions]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Handle token selection from modal
  const handleTokenSelect = useCallback(
    (token: TokenOption) => {
      setSelectedToken(token);
      setAmount(''); // Reset amount when switching tokens
      closeTokenModal();
    },
    [closeTokenModal],
  );

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
    handleClose,
  ]);

  return (
    <>
      <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <ModalContent size="md">
          <ModalHeader onClose={handleClose}>Send Tokens</ModalHeader>

          <ModalBody className="space-y-4">
            {/* Token Selection */}
            <div>
              <Typography variant="body2" className="mb-2 text-mono-100">
                Select Token
              </Typography>
              <div className="flex items-center justify-between">
                <TokenSelector onClick={openTokenModal}>
                  {selectedToken?.symbol ?? 'Select token'}
                </TokenSelector>

                {selectedToken && (
                  <Typography variant="body2" className="text-mono-100">
                    Balance:{' '}
                    {formatBalance(
                      selectedToken.balance,
                      selectedToken.decimals,
                    )}{' '}
                    {selectedToken.symbol}
                  </Typography>
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
                isControlled
                onChange={(val) => setRecipient(val)}
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
                    Max:{' '}
                    {formatBalance(
                      selectedToken.balance,
                      selectedToken.decimals,
                    )}{' '}
                    {selectedToken.symbol}
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.0"
                  value={amount}
                  isControlled
                  onChange={(val) => {
                    // Only allow valid number input
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setAmount(val);
                    }
                  }}
                  isInvalid={amount.length > 0 && !isValidAmount}
                />
                {selectedToken && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Typography variant="body2" className="text-mono-100">
                      {selectedToken.symbol}
                    </Typography>
                  </div>
                )}
              </div>
              {amount.length > 0 && !isValidAmount && selectedToken && (
                <Typography variant="body2" className="text-red-500 mt-1">
                  {parseFloat(amount) >
                  parseFloat(
                    formatUnits(selectedToken.balance, selectedToken.decimals),
                  )
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
                  <Typography
                    variant="body2"
                    className="text-mono-100 mt-1 break-all"
                  >
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

      {/* Token Selection Modal */}
      <ListModal<TokenOption>
        title="Select Token"
        isOpen={isTokenModalOpen}
        setIsOpen={updateTokenModal}
        onSelect={handleTokenSelect}
        isLoading={isLoadingAssets}
        filterItem={(token, query) =>
          filterBy(query, [token.symbol, token.name, token.address.toString()])
        }
        searchInputId="transfer-token-search"
        searchPlaceholder="Search tokens..."
        titleWhenEmpty="No Tokens Available"
        descriptionWhenEmpty="There are no tokens available in your wallet."
        items={tokenOptions}
        getItemKey={(token) => token.address.toString()}
        renderItem={(token) => (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <TokenIcon name={token.symbol} size="lg" />
              <div>
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
          </div>
        )}
      />
    </>
  );
};

export default TransferModal;
