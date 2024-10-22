'use client';

import { Modal, ModalContent, useModal } from '@webb-tools/webb-ui-components';
import ChainOrTokenButton from '@webb-tools/webb-ui-components/components/buttons/ChainOrTokenButton';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import AmountInput from '../../components/AmountInput';
import { AssetConfig, AssetList } from '../../components/Lists/AssetList';
import { BRIDGE_SUPPORTED_TOKENS } from '../../constants/bridge';
import { useBridge } from '../../context/BridgeContext';
import useExplorerUrl from '../../hooks/useExplorerUrl';
import { BridgeTokenId } from '../../types/bridge';
import convertDecimalToBn from '../../utils/convertDecimalToBn';
import useBalance from './hooks/useBalance';
import { useTokenBalances } from './hooks/useBalance';
import useDecimals from './hooks/useDecimals';
import useSelectedToken from './hooks/useSelectedToken';
import useTypedChainId from './hooks/useTypedChainId';

const AmountAndTokenInput: FC = () => {
  const {
    amount,
    setAmount,
    setSelectedTokenId,
    tokenIdOptions,
    setIsAmountInputError,
    isAmountInputError,
    selectedSourceChain,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const { balance, isLoading } = useBalance();
  const decimals = useDecimals();
  const { sourceTypedChainId } = useTypedChainId();

  const getExplorerUrl = useExplorerUrl();

  const minAmount = useMemo(() => {
    const existentialDeposit =
      selectedToken.existentialDeposit[sourceTypedChainId];
    const destChainTransactionFee =
      selectedToken.destChainTransactionFee[sourceTypedChainId];

    return (existentialDeposit ?? new Decimal(0)).add(
      destChainTransactionFee ?? new Decimal(0),
    );
  }, [
    selectedToken.existentialDeposit,
    selectedToken.destChainTransactionFee,
    sourceTypedChainId,
  ]);

  const {
    status: isTokenModalOpen,
    open: openTokenModal,
    close: closeTokenModal,
  } = useModal(false);

  const { getTokenBalance } = useTokenBalances();
  const [tokenBalances, setTokenBalances] = useState<
    Record<string, Decimal | null>
  >({});

  const fetchBalances = useCallback(async () => {
    const balances: Record<string, Decimal | null> = {};
    for (const tokenId of tokenIdOptions) {
      const token = BRIDGE_SUPPORTED_TOKENS[tokenId];
      const erc20TokenContractAddress =
        token.erc20TokenContractAddress?.[sourceTypedChainId];
      balances[tokenId] = await getTokenBalance(
        erc20TokenContractAddress ?? '0x0',
        token.decimals[sourceTypedChainId] ?? 18,
      );
    }
    setTokenBalances(balances);
  }, [tokenIdOptions, getTokenBalance, sourceTypedChainId]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const assets: AssetConfig[] = useMemo(() => {
    return tokenIdOptions.map((tokenId) => {
      const token = BRIDGE_SUPPORTED_TOKENS[tokenId];
      const erc20TokenContractAddress =
        token.erc20TokenContractAddress?.[sourceTypedChainId];
      const selectedChainExplorerUrl =
        selectedSourceChain.blockExplorers?.default;
      const explorerUrl = getExplorerUrl(
        erc20TokenContractAddress ?? '0x0',
        'address',
        'web3',
        selectedChainExplorerUrl?.url,
        false,
      );
      return {
        symbol: token.symbol,
        balance: tokenBalances[tokenId] ?? new Decimal(0),
        explorerUrl: explorerUrl?.toString(),
      };
    });
  }, [
    tokenIdOptions,
    sourceTypedChainId,
    selectedSourceChain.blockExplorers?.default,
    getExplorerUrl,
    tokenBalances,
  ]);

  const onSelectAsset = (asset: AssetConfig) => {
    setSelectedTokenId(asset.symbol as BridgeTokenId);
    closeTokenModal();
  };

  const selectedAssetBalance = useMemo(() => {
    return tokenBalances[selectedToken.id] ?? new Decimal(0);
  }, [tokenBalances, selectedToken.id]);

  return (
    <div className="relative">
      <div
        className={twMerge(
          'w-full flex items-center gap-2 bg-mono-20 dark:bg-mono-170 rounded-lg pr-4',
          isAmountInputError && 'border border-red-70 dark:border-red-50',
        )}
      >
        <AmountInput
          id="bridge-amount-input"
          title="Amount"
          amount={amount}
          setAmount={setAmount}
          wrapperOverrides={{
            isFullWidth: true,
          }}
          placeholder=""
          wrapperClassName="!pr-0 !border-0"
          max={balance ? convertDecimalToBn(balance, decimals) : null}
          maxErrorMessage="Insufficient balance"
          min={minAmount ? convertDecimalToBn(minAmount, decimals) : null}
          decimals={decimals}
          minErrorMessage="Amount too small"
          setErrorMessage={(error) =>
            setIsAmountInputError(error ? true : false)
          }
          errorMessageClassName="absolute left-0 bottom-[-24px] !text-[14px] !leading-[21px]"
        />

        {/* Token Selector */}
        <ChainOrTokenButton
          value={selectedToken.symbol}
          iconType="token"
          onClick={openTokenModal}
          className="w-[130px] border-0 px-3 bg-mono-40 dark:bg-mono-140"
          status="success"
        />
      </div>

      {isLoading ? (
        <SkeletonLoader
          size="md"
          className="w-[100px] absolute right-0 bottom-[-24px]"
        />
      ) : (
        <Typography
          variant="body2"
          className="absolute right-0 bottom-[-24px] text-mono-120 dark:text-mono-100"
        >
          Balance:{' '}
          {selectedAssetBalance !== null
            ? `${selectedAssetBalance.toString()} ${selectedToken.symbol}`
            : 'N/A'}
        </Typography>
      )}

      <Modal>
        {/* Token Selector Modal */}
        <ModalContent
          isCenter
          isOpen={isTokenModalOpen}
          onInteractOutside={closeTokenModal}
          className="w-[500px] h-[600px]"
        >
          <AssetList
            onClose={closeTokenModal}
            assets={assets}
            onSelectAsset={onSelectAsset}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AmountAndTokenInput;
