import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import assertRestakeAssetId from '@webb-tools/tangle-shared-ui/utils/assertRestakeAssetId';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import LogoListItem from '../../components/Lists/LogoListItem';
import filterBy from '../../utils/filterBy';

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
      renderItem={({ amount, assetId }) => {
        const metadata = assetMetadataMap[assetId];

        if (metadata === undefined) {
          return null;
        }

        const fmtAmount = addCommasToNumber(
          formatUnits(amount, metadata.decimals),
        );

        return (
          <LogoListItem
            logo={<TokenIcon size="xl" name={metadata.symbol} />}
            leftUpperContent={`${metadata.name} (${metadata.symbol})`}
            leftBottomContent={`Asset ID: ${assetId}`}
            rightUpperText={fmtAmount}
            rightBottomText={
              metadata.vaultId !== null
                ? `Vault ID: ${metadata.vaultId}`
                : undefined
            }
          />
        );
      }}
    />
  );
};

export default WithdrawModal;
