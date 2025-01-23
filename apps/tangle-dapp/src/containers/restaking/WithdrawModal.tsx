import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import filterBy from '../../utils/filterBy';
import LogoListItem from '../../components/Lists/LogoListItem';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import assertRestakeAssetId from '@webb-tools/tangle-shared-ui/utils/assertRestakeAssetId';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  isEvmAddress,
  shortenHex,
} from '@webb-tools/webb-ui-components';
import { findErc20Token } from '../../data/restake/useTangleEvmErc20Balances';
import { BN } from '@polkadot/util';

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
  const { assetMetadataMap } = useRestakeContext();

  // Aggregate the delegations based on the operator account id and asset id
  const deposits = useMemo(() => {
    if (!delegatorInfo?.deposits) {
      return [];
    }

    return Object.entries(delegatorInfo.deposits).map(
      ([assetId, { amount }]) => ({
        assetId: assertRestakeAssetId(assetId),
        amount,
      }),
    );
  }, [delegatorInfo]);

  return (
    <ListModal
      title="Select Asset"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      searchInputId="restake-withdraw-asset-search"
      searchPlaceholder="Search assets by ID or name..."
      items={deposits}
      titleWhenEmpty="No Assets Found"
      descriptionWhenEmpty="This account has no assets available to withdraw."
      onSelect={(deposit) => {
        const asset = assetMetadataMap[deposit.assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const fmtAmount = formatUnits(deposit.amount, decimals);

        onItemSelected({
          ...deposit,
          formattedAmount: fmtAmount,
        });
      }}
      filterItem={({ assetId }, query) => {
        const asset = assetMetadataMap[assetId];

        return filterBy(query, [asset?.name, asset?.id, asset?.vaultId]);
      }}
      // TODO: This can be cleaned up a bit. Seems like a bit of reused code.
      renderItem={({ amount, assetId }) => {
        let name: string;
        let symbol: string;
        let decimals: number;
        let vaultId: number | null = null;

        if (isEvmAddress(assetId)) {
          const erc20Token = findErc20Token(assetId);

          if (erc20Token === null) {
            return null;
          }

          name = erc20Token.name;
          symbol = erc20Token.symbol;
          decimals = erc20Token.decimals;
        } else {
          const metadata = assetMetadataMap[assetId];

          if (metadata === undefined) {
            return null;
          }

          name = metadata.name;
          symbol = metadata.symbol;
          decimals = metadata.decimals;
          vaultId = metadata.vaultId;
        }

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
            leftUpperContent={`${name} (${symbol})`}
            leftBottomContent={idText}
            rightUpperText={fmtAmount}
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
