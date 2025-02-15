import { BN } from '@polkadot/util';
import {
  DEFAULT_DECIMALS,
  ZERO_BIG_INT,
} from '@tangle-network/dapp-config/constants';
import { TokenIcon } from '@tangle-network/icons/TokenIcon';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { DelegatorInfo } from '@tangle-network/tangle-shared-ui/types/restake';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  isEvmAddress,
  shortenHex,
} from '@tangle-network/ui-components';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import LogoListItem from '../../components/Lists/LogoListItem';
import filterBy from '../../utils/filterBy';
import calculateRestakeAvailableBalance from '../../utils/restaking/calculateRestakeAvailableBalance';

type Props = {
  delegatorInfo: DelegatorInfo | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  onItemSelected: (item: {
    assetId: RestakeAssetId;
    amount: bigint;
    formattedAmount: string;
  }) => void;
};

const WithdrawModal = ({
  delegatorInfo,
  isOpen,
  setIsOpen,
  onItemSelected,
}: Props) => {
  const { assets } = useRestakeContext();

  const availableForWithdrawal = useMemo(() => {
    if (!delegatorInfo?.deposits) {
      return [];
    }

    return Object.entries(delegatorInfo.deposits).map(([assetIdString]) => {
      const availableForWithdrawal = calculateRestakeAvailableBalance(
        delegatorInfo,
        assertRestakeAssetId(assetIdString),
      );

      return {
        assetId: assertRestakeAssetId(assetIdString),
        amount: availableForWithdrawal ?? ZERO_BIG_INT,
      };
    });
  }, [delegatorInfo]);

  return (
    <ListModal
      title="Select Asset"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      searchInputId="restake-withdraw-asset-search"
      searchPlaceholder="Search assets by ID or name..."
      items={availableForWithdrawal}
      titleWhenEmpty="No Assets Found"
      descriptionWhenEmpty="This account has no assets available to withdraw."
      onSelect={(deposit) => {
        const asset = assets[deposit.assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const fmtAmount = formatUnits(deposit.amount, decimals);

        onItemSelected({
          ...deposit,
          formattedAmount: fmtAmount,
        });
      }}
      filterItem={({ assetId }, query) => {
        const asset = assets[assetId];

        return filterBy(query, [asset?.name, asset?.assetId, asset?.vaultId]);
      }}
      // TODO: This can be cleaned up a bit. Seems like a bit of reused code.
      renderItem={({ amount, assetId }) => {
        const metadata = assets[assetId];

        if (metadata === undefined) {
          return null;
        }

        const { name, symbol, decimals, vaultId } = metadata;

        const fmtAmount = formatDisplayAmount(
          new BN(amount.toString()),
          decimals,
          AmountFormatStyle.SHORT,
        );

        const idText = isEvmAddress(assetId)
          ? `Address: ${shortenHex(assetId)}`
          : `Asset ID: ${assetId}`;

        return (
          <LogoListItem
            logo={<TokenIcon size="xl" name={symbol} />}
            leftUpperContent={
              name !== undefined ? `${name} (${symbol})` : symbol
            }
            leftBottomContent={idText}
            rightUpperText={`${fmtAmount} ${symbol}`}
            rightBottomText={
              vaultId !== null ? `Vault ID: ${vaultId}` : undefined
            }
          />
        );
      }}
    />
  );
};

export default WithdrawModal;
