import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import type { IdentityType } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import { useMemo } from 'react';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config';
import { formatUnits } from 'viem';
import searchBy from '../../../utils/searchBy';
import OperatorListItem from '../../../components/Lists/OperatorListItem';

type Props = {
  delegatorInfo: DelegatorInfo | null;
  operatorIdentities?: Record<string, IdentityType | null> | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  onItemSelected: (
    item: DelegatorInfo['delegations'][number] & {
      formattedAmount: string;
    },
  ) => void;
};

const SelectOperatorModal = ({
  delegatorInfo,
  isOpen,
  setIsOpen,
  onItemSelected,
  operatorIdentities,
}: Props) => {
  const { assetMap } = useRestakeContext();

  // Aggregate the delegations based on the operator account ID and asset ID.
  const delegations = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations)) {
      return [];
    }

    return delegatorInfo.delegations;
  }, [delegatorInfo]);

  return (
    <ListModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      searchInputId="restake-unstake-operator-search"
      searchPlaceholder="Search operators by account ID..."
      items={delegations}
      title="Select Operator"
      titleWhenEmpty="No Delegation Found"
      descriptionWhenEmpty="Have you deposited or delegated an asset to an operator yet?"
      onSelect={(item) => {
        const asset = assetMap[item.assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const fmtAmount = formatUnits(item.amountBonded, decimals);

        onItemSelected({
          ...item,
          formattedAmount: fmtAmount,
        });
      }}
      filterItems={(item, query) => {
        const asset = assetMap[item.assetId];
        const assetSymbol = asset?.symbol;
        const identityName = operatorIdentities?.[item.operatorAccountId]?.name;

        return searchBy(query, [
          item.operatorAccountId,
          assetSymbol,
          identityName,
        ]);
      }}
      renderItem={({ amountBonded, assetId, operatorAccountId }) => {
        const asset = assetMap[assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const assetSymbol = asset?.symbol || 'Unknown';
        const fmtAmount = formatUnits(amountBonded, decimals);
        const identityName = operatorIdentities?.[operatorAccountId]?.name;

        return (
          <OperatorListItem
            accountAddress={operatorAccountId}
            identity={identityName ?? undefined}
          />
        );
      }}
    />
  );
};

export default SelectOperatorModal;
