import { DelegatorInfo } from '@tangle-network/tangle-shared-ui/types/restake';
import type { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { useMemo } from 'react';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { formatUnits } from 'viem';
import OperatorListItem from '../../components/Lists/OperatorListItem';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import { BN } from '@polkadot/util';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import useRestakeCurrentRound from '../../data/restake/useRestakeCurrentRound';

type Props = {
  delegatorInfo: DelegatorInfo | null;
  operatorIdentities?: Map<string, IdentityType | null> | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  onItemSelected: (
    item: DelegatorInfo['delegations'][number] & {
      formattedAmount: string;
      isReadyToUnstake: boolean;
      undelegatableAmount: bigint;
    },
  ) => void;
};

const calculateUndelegatableAmount = (
  delegation: DelegatorInfo['delegations'][number],
  unstakeRequests: DelegatorInfo['unstakeRequests'],
): bigint => {
  const pendingUnstakeAmount = unstakeRequests
    .filter(
      (req) =>
        req.operatorAccountId === delegation.operatorAccountId &&
        req.assetId === delegation.assetId,
    )
    .reduce((sum, req) => sum + req.amount, BigInt(0));

  const availableAmount = delegation.amountBonded - pendingUnstakeAmount;
  return availableAmount > BigInt(0) ? availableAmount : BigInt(0);
};

const SelectOperatorModalEnhanced = ({
  delegatorInfo,
  isOpen,
  setIsOpen,
  onItemSelected,
  operatorIdentities,
}: Props) => {
  const { assets } = useRestakeAssets();
  const { result: currentRound } = useRestakeCurrentRound();

  const availableDelegations = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations)) {
      return [];
    }

    return delegatorInfo.delegations
      .map((delegation) => {
        const undelegatableAmount = calculateUndelegatableAmount(
          delegation,
          delegatorInfo.unstakeRequests || [],
        );

        const pendingRequest = delegatorInfo.unstakeRequests?.find(
          (req) =>
            req.operatorAccountId === delegation.operatorAccountId &&
            req.assetId === delegation.assetId,
        );

        const isRequestReady =
          !pendingRequest ||
          (currentRound !== null && pendingRequest.requestedRound <= currentRound) ||
          false;

        return {
          ...delegation,
          undelegatableAmount,
          pendingUnstakeRequest: pendingRequest,
          isRequestReady,
        };
      })
      .filter((item) => item.undelegatableAmount > BigInt(0));
  }, [delegatorInfo, currentRound]);

  return (
    <ListModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      searchInputId="restake-undelegate-operator-search"
      searchPlaceholder="Search operators..."
      items={availableDelegations}
      title="Select Operator to Unstake"
      titleWhenEmpty="No Delegations Found"
      descriptionWhenEmpty="No delegations available for unstaking. You may need to wait for pending unstake requests to complete or delegate assets first."
      onSelect={(item) => {
        const asset = assets?.get(item.assetId);

        if (asset === undefined) {
          return;
        }

        const fmtAmount = formatUnits(
          item.undelegatableAmount,
          asset.metadata.decimals,
        );

        onItemSelected({
          ...item,
          formattedAmount: fmtAmount,
          isReadyToUnstake: item.isRequestReady,
          undelegatableAmount: item.undelegatableAmount,
        });
      }}
      filterItem={(delegation, query) => {
        const asset = assets?.get(delegation.assetId);

        if (asset === undefined) {
          return false;
        }

        const assetSymbol = asset.metadata.symbol;

        const identityName = operatorIdentities?.get(
          delegation.operatorAccountId,
        )?.name;

        return filterBy(query, [
          delegation.operatorAccountId,
          assetSymbol,
          identityName,
        ]);
      }}
      renderItem={(item) => {
        const asset = assets?.get(item.assetId);

        if (asset === undefined) {
          return null;
        }

        const fmtAmount = formatDisplayAmount(
          new BN(item.undelegatableAmount.toString()),
          asset.metadata.decimals,
          AmountFormatStyle.SHORT,
        );

        const identityName = operatorIdentities?.get(
          item.operatorAccountId,
        )?.name;

        const assetLabel = item.isNomination ? 'Nominated' : 'Deposited';
        
        const statusText = item.pendingUnstakeRequest && !item.isRequestReady
          ? `Waiting (Round ${item.pendingUnstakeRequest.requestedRound})`
          : 'Available';

        return (
          <div className="flex items-center justify-between w-full">
            <OperatorListItem
              accountAddress={item.operatorAccountId}
              identity={identityName ?? undefined}
              rightUpperText={`${fmtAmount} ${asset.metadata.symbol}`}
              rightBottomText={`${assetLabel} • ${statusText}`}
            />
            {item.pendingUnstakeRequest && currentRound && !item.isRequestReady && (
              <Typography variant="body2" className="text-mono-100 ml-2">
                {item.pendingUnstakeRequest.requestedRound - currentRound} rounds left
              </Typography>
            )}
          </div>
        );
      }}
    />
  );
};

export default SelectOperatorModalEnhanced;
