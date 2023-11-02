import type { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import type { RelayerFeeInfo } from '@webb-tools/abstract-api-provider/relayer/webb-relayer';
import type { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import type { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { ExternalLinkLine } from '@webb-tools/icons/ExternalLinkLine';
import GasStationFill from '@webb-tools/icons/GasStationFill';
import { FeeDetails } from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { formatEther } from 'viem';
import { getRelayerFeePercentage } from '../utils';
import { type FC, useMemo } from 'react';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';

interface RelayerFeeDetailsProps {
  totalFeeWei: bigint | undefined;
  totalFeeToken: string | undefined;
  gasFeeInfo: bigint | undefined;
  relayerFeeInfo: RelayerFeeInfo | undefined;
  isFeeLoading: boolean | undefined;
  srcChainCfg: ChainConfig | undefined;
  fungibleCfg: CurrencyConfig | undefined;
  activeRelayer: OptionalActiveRelayer;
  info?: string;
}

const RelayerFeeDetails: FC<RelayerFeeDetailsProps> = ({
  activeRelayer,
  fungibleCfg,
  gasFeeInfo,
  isFeeLoading,
  relayerFeeInfo,
  srcChainCfg,
  totalFeeToken,
  totalFeeWei,
  info,
}) => {
  const relayerFeePercentage = useMemo(() => {
    if (!activeRelayer || !srcChainCfg) {
      return;
    }

    const typedChainId = calculateTypedChainId(
      srcChainCfg.chainType,
      srcChainCfg.id
    );

    return getRelayerFeePercentage(activeRelayer, typedChainId);
  }, [activeRelayer, srcChainCfg]);

  return (
    <FeeDetails
      info={info}
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
