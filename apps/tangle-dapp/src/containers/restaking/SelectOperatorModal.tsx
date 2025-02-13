import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import { DelegatorInfo } from '@tangle-network/tangle-shared-ui/types/restake';
import type { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { useMemo } from 'react';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { DEFAULT_DECIMALS } from '@tangle-network/dapp-config';
import { formatUnits } from 'viem';
import filterBy from '../../utils/filterBy';
import OperatorListItem from '../../components/Lists/OperatorListItem';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/webb-ui-components';
import { BN } from '@polkadot/util';

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
  const { assets } = useRestakeContext();

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
      searchInputId="restake-undelegate-operator-search"
      searchPlaceholder="Search operators by account ID..."
      items={delegations}
      title="Select Operator"
      titleWhenEmpty="No Delegation Found"
      descriptionWhenEmpty="Have you deposited or delegated an asset to an operator yet?"
      onSelect={(item) => {
        const asset = assets[item.assetId];
        const decimals = asset?.decimals || DEFAULT_DECIMALS;
        const fmtAmount = formatUnits(item.amountBonded, decimals);

        onItemSelected({
          ...item,
          formattedAmount: fmtAmount,
        });
      }}
      filterItem={(delegation, query) => {
        const metadata = assets[delegation.assetId];

        if (metadata === undefined) {
          return false;
        }

        const assetSymbol = metadata?.symbol;

        const identityName =
          operatorIdentities?.[delegation.operatorAccountId]?.name;

        return filterBy(query, [
          delegation.operatorAccountId,
          assetSymbol,
          identityName,
        ]);
      }}
      renderItem={({ amountBonded, assetId, operatorAccountId }) => {
        const asset = assets[assetId];

        if (asset === undefined) {
          return null;
        }

        const fmtAmount = formatDisplayAmount(
          new BN(amountBonded.toString()),
          asset.decimals,
          AmountFormatStyle.SHORT,
        );

        const identityName = operatorIdentities?.[operatorAccountId]?.name;

        return (
          <OperatorListItem
            accountAddress={operatorAccountId}
            identity={identityName ?? undefined}
            rightUpperText={`${fmtAmount} ${asset.symbol}`}
            rightBottomText="Delegated"
          />
        );
      }}
    />
  );
};

export default SelectOperatorModal;
