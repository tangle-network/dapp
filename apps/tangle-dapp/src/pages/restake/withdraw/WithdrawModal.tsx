import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import searchBy from '../../../utils/searchBy';
import LogoListItem from '../../../components/Lists/LogoListItem';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';

type Props = {
  delegatorInfo: DelegatorInfo | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onItemSelected: (item: {
    assetId: string;
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
  const { assetMap } = useRestakeContext();

  // Aggregate the delegations based on the operator account id and asset id
  const deposits = useMemo(() => {
    if (!delegatorInfo?.deposits) {
      return [];
    }

    return Object.entries(delegatorInfo.deposits).map(
      ([assetId, { amount }]) => ({
        assetId,
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
      searchPlaceholder="Search assets..."
      items={deposits}
      titleWhenEmpty="No Assets Found"
      descriptionWhenEmpty="This account has no assets to withdraw."
      onSelect={(item) => {
        const asset = assetMap[item.assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const fmtAmount = formatUnits(item.amount, decimals);

        onItemSelected({
          ...item,
          formattedAmount: fmtAmount,
        });
      }}
      filterItem={({ assetId }, query) => {
        const asset = assetMap[assetId];

        return searchBy(query, [asset?.name, asset?.id, asset?.vaultId]);
      }}
      renderItem={({ amount, assetId }) => {
        const asset = assetMap[assetId];

        if (asset === undefined) {
          return null;
        }

        const fmtAmount = addCommasToNumber(
          formatUnits(amount, asset.decimals),
        );

        return (
          <LogoListItem
            logo={<TokenIcon size="xl" name={asset.symbol} />}
            leftUpperContent={`${asset.name} (${asset.symbol})`}
            leftBottomContent={`Asset ID: ${assetId}`}
            rightUpperText={fmtAmount}
            rightBottomText={
              asset.vaultId !== null ? `Vault ID: ${asset.vaultId}` : undefined
            }
          />
        );
      }}
    />
  );
};

export default WithdrawModal;
