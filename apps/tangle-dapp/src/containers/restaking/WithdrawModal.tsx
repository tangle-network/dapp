import { BN } from '@polkadot/util';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { DelegatorInfo } from '@tangle-network/tangle-shared-ui/types/restake';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import AssetListItem from '../../components/Lists/AssetListItem';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
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
  const { assets } = useRestakeAssets();
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
      searchPlaceholder="Search assets..."
      items={availableForWithdrawal}
      titleWhenEmpty="No Assets Found"
      descriptionWhenEmpty="This account has no assets available to withdraw."
      onSelect={(deposit) => {
        const asset = assets?.get(deposit.assetId);

        if (asset === undefined) {
          return;
        }

        const fmtAmount = formatUnits(deposit.amount, asset.metadata.decimals);

        onItemSelected({
          ...deposit,
          formattedAmount: fmtAmount,
        });
      }}
      filterItem={({ assetId }, query) => {
        const asset = assets?.get(assetId);

        return filterBy(query, [
          asset?.metadata.name,
          asset?.metadata.assetId,
          asset?.metadata.vaultId,
        ]);
      }}
      renderItem={({ amount, assetId }) => {
        const asset = assets?.get(assetId);

        if (asset === undefined) {
          return null;
        }

        const displayName =
          assetId === '0' ? 'Tangle Network Token' : asset.metadata.name;

        return (
          <AssetListItem
            assetId={assetId}
            name={displayName}
            symbol={asset.metadata.symbol}
            balance={new BN(amount.toString())}
            decimals={asset.metadata.decimals}
            rightBottomText="Balance"
            // TODO: Do we need to display vault id here?
            // leftBottomContentTwo={
            //   asset.metadata.vaultId !== null
            //     ? `Vault Id: ${asset.metadata.vaultId}`
            //     : undefined
            // }
          />
        );
      }}
    />
  );
};

export default WithdrawModal;
