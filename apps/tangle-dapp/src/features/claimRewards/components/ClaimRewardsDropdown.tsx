import { BN } from '@polkadot/util';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import {
  TANGLE_TOKEN_DECIMALS,
  ZERO_BIG_INT,
} from '@tangle-network/dapp-config';
import { Spinner } from '@tangle-network/icons';
import VipDiamondLine from '@tangle-network/icons/VipDiamondLine';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  Button,
  formatDisplayAmount,
  Typography,
} from '@tangle-network/ui-components';
import {
  Dropdown,
  DropdownBody,
  DropdownButton,
} from '@tangle-network/ui-components/components/Dropdown';
import { useCallback, useMemo } from 'react';
import useActiveAccountReward from '../data/useActiveAccountReward';
import useClaimRewardsTx from '../data/useClaimRewardsTx';

const ClaimRewardsDropdown = () => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const { data, error, refetch, isPending } = useActiveAccountReward();

  const claimableAssets = useMemo(() => {
    if (!data) {
      return null;
    }

    // Include only non-zero entries.
    return new Map(data.entries().filter(([_, value]) => value > ZERO_BIG_INT));
  }, [data]);

  const totalRewardsFormatted = useMemo(() => {
    if (!data) {
      return '0';
    }

    const totalRewards = data
      .values()
      .reduce((acc, current) => acc + current, ZERO_BIG_INT);

    return formatDisplayAmount(
      new BN(totalRewards.toString()),
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.SHORT,
    );
  }, [data]);

  // Hide if there's no rewards to claim.
  if (data === undefined) {
    return;
  }

  return (
    <Dropdown>
      <DropdownButton
        disabled={isPending || error !== null}
        isHideArrowIcon={isPending || error !== null}
        icon={
          isPending ? (
            <Spinner size="lg" />
          ) : error ? (
            <CrossCircledIcon className="size-6" />
          ) : (
            <VipDiamondLine size="lg" />
          )
        }
      >
        <span className="hidden sm:inline-block">
          {isPending
            ? 'Fetching rewards...'
            : error
              ? error.name
              : totalRewardsFormatted}
        </span>
      </DropdownButton>

      <DropdownBody align="start" sideOffset={8} className="p-4 space-y-3">
        <Typography variant="body3" fw="bold" className="!text-muted uppercase">
          Unclaimed rewards
        </Typography>

        <Typography variant="h4" component="p" fw="bold">
          {totalRewardsFormatted} {nativeTokenSymbol}
        </Typography>

        <Typography variant="body2" fw="semibold" className="!text-muted">
          Earn TNT rewards by restaking.
        </Typography>

        <ClaimRewardButton
          claimableAssets={claimableAssets}
          refetchReward={refetch}
        />
      </DropdownBody>
    </Dropdown>
  );
};

export default ClaimRewardsDropdown;

type ClaimRewardButtonProps<RefetchArgs, Result> = {
  claimableAssets: Map<RestakeAssetId, bigint> | null;
  refetchReward: (...args: RefetchArgs[]) => Promise<Result>;
};

const ClaimRewardButton = <RefetchArgs, Result>({
  claimableAssets,
  refetchReward,
}: ClaimRewardButtonProps<RefetchArgs, Result>) => {
  const { execute, status } = useClaimRewardsTx();

  const handleClick = useCallback(async () => {
    if (execute === null || claimableAssets === null) {
      return null;
    }

    await execute({ assetIds: Array.from(claimableAssets.keys()) });

    await refetchReward();
  }, [claimableAssets, execute, refetchReward]);

  const isLoading = useMemo(() => status === TxStatus.PROCESSING, [status]);

  return (
    <Button
      isFullWidth
      isDisabled={claimableAssets === null || claimableAssets.size === 0}
      onClick={handleClick}
      isLoading={isLoading}
    >
      Claim
    </Button>
  );
};
