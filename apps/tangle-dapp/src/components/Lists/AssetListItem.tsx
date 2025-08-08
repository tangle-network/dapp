import { TokenIcon, ArrowRightUp } from '@tangle-network/icons';
import { ChainType } from '@tangle-network/dapp-types';
import {
  AmountFormatStyle,
  CopyWithTooltip,
  formatDisplayAmount,
  isEvmAddress,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import { makeExplorerUrl } from '@tangle-network/api-provider-environment/transaction/utils';
import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import LogoListItem from './LogoListItem';
import { BN } from '@polkadot/util';
import { getAssetLabelColorClasses } from '../../utils/getAssetLabelColorClasses';

type Props = {
  assetId: string;
  name?: string;
  symbol: string;
  balance: BN;
  decimals: number;
  rightBottomText?: string;
  leftBottomContentTwo?: string;
  label?: string;
  labelColor?: 'green' | 'purple' | 'blue' | 'red' | 'yellow';
};

const AssetListItem = ({
  assetId,
  name,
  symbol,
  balance,
  decimals,
  rightBottomText = 'Balance',
  leftBottomContentTwo,
  label,
  labelColor,
}: Props) => {
  const activeChain = useActiveChain();

  const fmtBalance = formatDisplayAmount(
    balance,
    decimals,
    AmountFormatStyle.SHORT,
  );

  const assetIdIsEvmAddress = isEvmAddress(assetId);
  const activeChainIsEvm = activeChain[0]?.chainType === ChainType.EVM;
  let assetExplorerUrl = null;

  if (activeChainIsEvm && assetIdIsEvmAddress) {
    assetExplorerUrl = activeChain[0]?.blockExplorers?.default?.url
      ? makeExplorerUrl(
          activeChain[0].blockExplorers.default.url,
          assetId,
          'address',
          'web3',
        )
      : null;
  }

  const leftBottomContent =
    assetIdIsEvmAddress && assetExplorerUrl ? (
      <a
        href={assetExplorerUrl}
        target="_blank"
        rel="noreferrer"
        className="z-20 flex items-center gap-1 text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
      >
        <Typography
          variant="body1"
          className="text-current dark:text-current dark:hover:text-current"
        >
          {assetId ? shortenHex(assetId) : 'View Explorer'}
        </Typography>

        <ArrowRightUp className="fill-current dark:fill-current" />
      </a>
    ) : (
      <Typography
        variant="body1"
        className="text-mono-120 dark:text-mono-100 dark:hover:text-mono-80 flex items-center gap-2"
      >
        Asset Id: {assetIdIsEvmAddress ? shortenHex(assetId) : assetId}
        <CopyWithTooltip textToCopy={assetId} className="" isButton={false} />
      </Typography>
    );

  // Create the display name with label
  const displayName = (() => {
    if (name === undefined) {
      return symbol;
    }

    if (label && labelColor) {
      return (
        <div className="flex items-center gap-2">
          <span>
            {name} ({symbol})
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getAssetLabelColorClasses(labelColor)}`}
          >
            {label}
          </span>
        </div>
      );
    }

    return `${name} (${symbol})`;
  })();

  return (
    <LogoListItem
      logo={<TokenIcon size="xl" name={symbol} />}
      leftUpperContent={displayName}
      leftBottomContent={leftBottomContent}
      leftBottomContentTwo={leftBottomContentTwo}
      rightUpperText={`${fmtBalance} ${symbol}`}
      rightBottomText={rightBottomText}
    />
  );
};

export default AssetListItem;
