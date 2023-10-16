import type { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import type { RelayerFeeInfo } from '@webb-tools/abstract-api-provider/relayer/webb-relayer';
import type { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import type { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { ExternalLinkLine } from '@webb-tools/icons/ExternalLinkLine';
import GasStationFill from '@webb-tools/icons/GasStationFill';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { FeeDetails } from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { ComponentProps } from 'react';
import { formatEther } from 'viem';

const RelayerFeeDetails = (props: {
  totalFeeWei: bigint | undefined;
  totalFeeToken: string | undefined;
  gasFeeInfo: bigint | undefined;
  relayerFeeInfo: RelayerFeeInfo | undefined;
  isFeeLoading: boolean | undefined;
  srcChainCfg: ChainConfig | undefined;
  fungibleCfg: CurrencyConfig | undefined;
  activeRelayer: OptionalActiveRelayer;
}) => {
  const {
    activeRelayer,
    fungibleCfg,
    gasFeeInfo,
    isFeeLoading,
    relayerFeeInfo,
    srcChainCfg,
    totalFeeToken,
    totalFeeWei,
  } = props;

  const relayerFeePercentage = useRealyerFeePercentage({
    activeRelayer,
    srcChainCfg,
  });

  return (
    <FeeDetails
      isTotalLoading={isFeeLoading}
      totalFee={
        typeof totalFeeWei === 'bigint'
          ? parseFloat(formatEther(totalFeeWei))
          : undefined
      }
      totalFeeToken={
        typeof totalFeeWei === 'bigint' ? totalFeeToken : undefined
      }
      items={
        [
          typeof gasFeeInfo === 'bigint'
            ? ({
                name: 'Gas',
                isLoading: isFeeLoading,
                Icon: <GasStationFill />,
                value: parseFloat(formatEther(gasFeeInfo).slice(0, 10)),
                tokenSymbol: srcChainCfg?.nativeCurrency.symbol,
              } satisfies FeeItem)
            : undefined,
          typeof relayerFeeInfo !== 'undefined'
            ? ({
                name: `Relayer Fee ${
                  typeof relayerFeePercentage === 'number'
                    ? `(${relayerFeePercentage.toFixed(2)}%)`
                    : ''
                }`.trim(),
                isLoading: isFeeLoading,
                value: parseFloat(
                  formatEther(relayerFeeInfo.estimatedFee).slice(0, 10)
                ),
                tokenSymbol: fungibleCfg?.symbol,
              } satisfies FeeItem)
            : undefined,
          activeRelayer?.beneficiary
            ? ({
                name: 'Relayer',
                value: (
                  <div className="flex items-center gap-1">
                    <Typography
                      variant="body1"
                      fw="bold"
                      className="text-mono-200 dark:text-mono-0"
                    >
                      {new URL(activeRelayer.endpoint).host}
                    </Typography>

                    <a
                      href={activeRelayer.infoUri}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkLine className="fill-mono-120 dark:fill-mono-100" />
                    </a>
                  </div>
                ),
              } satisfies FeeItem)
            : undefined,
        ].filter((item) => Boolean(item)) as Array<FeeItem>
      }
    />
  );
};

export default RelayerFeeDetails;

type Args = Pick<
  ComponentProps<typeof RelayerFeeDetails>,
  'activeRelayer' | 'srcChainCfg'
>;

const useRealyerFeePercentage = (args: Args) => {
  const { activeRelayer, srcChainCfg } = args;

  if (!srcChainCfg) return;

  const typedChainId = calculateTypedChainId(
    srcChainCfg.chainType,
    srcChainCfg.id
  );

  const supportedChains = activeRelayer?.capabilities?.supportedChains;
  if (!supportedChains) return;

  const chain =
    srcChainCfg.chainType === ChainType.Substrate
      ? supportedChains.substrate.get(typedChainId)
      : supportedChains.evm.get(typedChainId);

  if (!chain) return;

  return chain?.relayerFeeConfig.relayerProfitPercent;
};
