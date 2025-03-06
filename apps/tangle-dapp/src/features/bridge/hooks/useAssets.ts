import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { BridgeTokenWithBalance } from '@tangle-network/tangle-shared-ui/types';
import { AssetConfig } from '../../../components/Lists/AssetList';
import useIsNativeToken from './useIsNativeToken';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import useBridgeStore from '../context/useBridgeStore';
import { useShallow } from 'zustand/react/shallow';
import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { makeExplorerUrl } from '@tangle-network/api-provider-environment/transaction/utils/makeExplorerUrl';
import convertDecimalToBN from '@tangle-network/tangle-shared-ui/utils/convertDecimalToBn';
import Decimal from 'decimal.js';
import { assertEvmAddress } from '@tangle-network/ui-components/utils/assertEvmAddress';

/**
 * Hook to get the list of formatted bridge assets that is used to display on the AssetList modal.
 *
 * @param {number} sourceTypedChainId The typed chain ID of the source chain
 * @param {Partial<Record<PresetTypedChainId, BridgeTokenWithBalance[]>>} tokenBalances Record of token balances by chain ID
 * @returns {AssetConfig[]} A list of asset configurations that is used to display on the AssetList modal.
 */
export default function useAssets(
  sourceTypedChainId: number,
  tokenBalances: Partial<Record<PresetTypedChainId, BridgeTokenWithBalance[]>>,
): AssetConfig[] {
  const selectedSourceChain = useBridgeStore(
    useShallow((store) => store.selectedSourceChain),
  );
  const tokens = useBridgeStore(useShallow((store) => store.tokens));
  const [activeAccount] = useActiveAccount();

  const isNativeToken = useIsNativeToken(
    calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    ),
  );

  const isSourceTangleChain =
    sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
    sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM;

  const { data: nativeTokenBalance } = useBalance({
    address: activeAccount?.address as `0x${string}`,
    chainId: selectedSourceChain.id,
    query: {
      enabled: activeAccount !== null,
    },
  });

  return tokens.map((token) => {
    const balance = (() => {
      if (
        isNativeToken &&
        (sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
          sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM) &&
        token.tokenType === 'TNT'
      ) {
        return nativeTokenBalance?.value !== undefined
          ? formatEther(nativeTokenBalance.value)
          : undefined;
      }

      if (
        isNativeToken &&
        sourceTypedChainId === PresetTypedChainId.Polygon &&
        token.symbol === 'POL'
      ) {
        return nativeTokenBalance?.value !== undefined
          ? formatEther(nativeTokenBalance.value)
          : undefined;
      }

      if (
        (isNativeToken &&
          (sourceTypedChainId === PresetTypedChainId.Optimism ||
            sourceTypedChainId === PresetTypedChainId.Arbitrum ||
            sourceTypedChainId === PresetTypedChainId.Base) &&
          token.symbol === 'ETH') ||
        (sourceTypedChainId === PresetTypedChainId.BSC &&
          token.symbol === 'BNB')
      ) {
        return nativeTokenBalance?.value !== undefined
          ? formatEther(nativeTokenBalance.value)
          : undefined;
      }

      const tokenBalance = tokenBalances?.[sourceTypedChainId]?.find(
        (tokenBalance: BridgeTokenWithBalance) =>
          tokenBalance.address === token.address,
      );

      return isSourceTangleChain
        ? tokenBalance?.syntheticBalance
        : tokenBalance?.balance;
    })();

    const selectedChainExplorerUrl =
      selectedSourceChain.blockExplorers?.default;

    const address = isSourceTangleChain
      ? token.hyperlaneSyntheticAddress
      : (token.address as `0x${string}`);

    const tokenExplorerUrl = selectedChainExplorerUrl?.url
      ? makeExplorerUrl(
          selectedChainExplorerUrl.url,
          (isSourceTangleChain
            ? token.hyperlaneSyntheticAddress
            : token.address) ?? '',
          'address',
          'web3',
        )
      : undefined;

    const formattedBalance = (() => {
      if (!activeAccount || !balance) return undefined;

      return typeof balance === 'string'
        ? convertDecimalToBN(new Decimal(balance), token.decimals)
        : convertDecimalToBN(balance, token.decimals);
    })();

    return {
      id: token.tokenType,
      name: token.name,
      symbol: token.tokenType,
      optionalSymbol: token.symbol,
      balance: formattedBalance,
      explorerUrl: !isNativeToken ? tokenExplorerUrl : undefined,
      address: address !== undefined ? assertEvmAddress(address) : undefined,
      decimals: token.decimals,
    } satisfies AssetConfig;
  });
}
