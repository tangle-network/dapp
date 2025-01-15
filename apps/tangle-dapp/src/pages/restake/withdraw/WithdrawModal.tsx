import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import filterBy from '../../../utils/filterBy';
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
      searchPlaceholder="Search assets by ID or name..."
      items={deposits}
      titleWhenEmpty="No Assets Found"
      descriptionWhenEmpty="This account has no assets available to withdraw."
      onSelect={(deposit) => {
        const asset = assetMap[deposit.assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const fmtAmount = formatUnits(deposit.amount, decimals);

        onItemSelected({
          ...deposit,
          formattedAmount: fmtAmount,
        });
      }}
      filterItem={({ assetId }, query) => {
        const asset = assetMap[assetId];

        return filterBy(query, [asset?.name, asset?.id, asset?.vaultId]);
      }}
      renderItem={({ amount, assetId }) => {
        const metadata = assetMap[assetId];

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
