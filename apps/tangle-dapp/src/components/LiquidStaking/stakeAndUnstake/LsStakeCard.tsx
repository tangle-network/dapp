import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@tangle-network/icons';
import { Card } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LsPoolDisplayName } from '../../../constants/liquidStaking/types';
import useLsPoolJoinTx from '../../../data/liquidStaking/tangle/useLsPoolJoinTx';
import useLsExchangeRate from '../../../data/liquidStaking/useLsExchangeRate';
import useAssetAccounts from '../../../data/liquidStaking/useAssetAccounts';
import useLsPools from '../../../data/liquidStaking/useLsPools';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import DetailsContainer from '../../DetailsContainer';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsInput from './LsInput';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import LstListItem from '../LstListItem';
import filterBy from '../../../utils/filterBy';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useLsAgnosticBalance from './useLsAgnosticBalance';

const LsStakeCard: FC = () => {
  const lsPools = useLsPools();
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);
  const { lsPoolId, setLsPoolId } = useLsStore();

  const { execute: executeTanglePoolJoinTx, status: tanglePoolJoinTxStatus } =
    useLsPoolJoinTx();

  const activeAccountAddress = useActiveAccountAddress();

  const lsPoolMembers = useAssetAccounts();
  const fromLsInputRef = useRef<HTMLInputElement>(null);

  const actionText = useMemo(() => {
    const defaultText = 'Stake';

    if (lsPoolMembers === null) {
      return defaultText;
    }

    const isMember = lsPoolMembers.some(
      ([poolId, accountAddress]) =>
        poolId === lsPoolId && accountAddress === activeAccountAddress,
    );

    return isMember ? 'Increase Stake' : defaultText;
  }, [activeAccountAddress, lsPoolMembers, lsPoolId]);

  const exchangeRate = useLsExchangeRate();

  const handleStakeClick = useCallback(async () => {
    // Not ready yet; no amount given.
    if (fromAmount === null) {
      return;
    }

    if (executeTanglePoolJoinTx !== null && lsPoolId !== null) {
      executeTanglePoolJoinTx({
        amount: fromAmount,
        poolId: lsPoolId,
      });
    }
  }, [executeTanglePoolJoinTx, fromAmount, lsPoolId]);

  const toAmount = useMemo(() => {
    if (
      fromAmount === null ||
      exchangeRate === null ||
      exchangeRate === undefined
    ) {
      return null;
    }

    return fromAmount.muln(exchangeRate);
  }, [fromAmount, exchangeRate]);

  const canCallStake = executeTanglePoolJoinTx !== null && lsPoolId !== null;

  const balance = useLsAgnosticBalance(true);

  const walletBalance = (
    <LsAgnosticBalance
      tooltip="Available Balance"
      onClick={() => {
        if (balance instanceof BN) {
          setFromAmount(balance);
        }
      }}
    />
  );

  // Reset the input amount when the network changes.
  useEffect(() => {
    setFromAmount(null);
  }, [setFromAmount]);

  // Reset the input amount when the transaction is processed.
  useEffect(() => {
    if (tanglePoolJoinTxStatus === TxStatus.COMPLETE) {
      setFromAmount(null);
    }
  }, [setFromAmount, tanglePoolJoinTxStatus]);

  // On mount, set the focus on the from input.
  useEffect(() => {
    if (fromLsInputRef.current !== null) {
      fromLsInputRef.current.focus();
    }
  }, []);

  const allPools = useMemo(() => {
    if (!(lsPools instanceof Map)) {
      return lsPools;
    }

    return Array.from(lsPools.values());
  }, [lsPools]);

  return (
    <Card
      withShadow
      tightPadding
      className="flex flex-col items-stretch justify-center gap-2"
    >
      <LsInput
        ref={fromLsInputRef}
        id="liquid-staking-stake-from"
        amount={fromAmount}
        onAmountChange={setFromAmount}
        placeholder="Enter amount to stake"
        rightElement={walletBalance}
        maxAmount={balance instanceof BN ? balance : undefined}
        showPoolIndicator={false}
      />

      <ArrowDownIcon className="self-center dark:fill-mono-0 w-7 h-7" />

      <LsInput
        id="liquid-staking-stake-to"
        placeholder={EMPTY_VALUE_PLACEHOLDER}
        amount={toAmount}
        isReadOnly
        isDerivativeVariant
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
      />

      {/* Details */}
      <DetailsContainer>
        <UnstakePeriodDetailItem />

        <ExchangeRateDetailItem />
      </DetailsContainer>

      <Button
        isDisabled={
          // No active account.
          activeAccountAddress === null ||
          !canCallStake ||
          // No amount entered or amount is zero.
          fromAmount === null ||
          fromAmount.isZero()
        }
        isLoading={tanglePoolJoinTxStatus === TxStatus.PROCESSING}
        onClick={handleStakeClick}
        isFullWidth
      >
        {actionText}
      </Button>

      <ListModal
        title="Select LST"
        searchInputId="ls-stake-select-lst-search"
        searchPlaceholder="Search liquid staking tokens by name or ID..."
        items={allPools}
        isOpen={isSelectTokenModalOpen}
        setIsOpen={setIsSelectTokenModalOpen}
        titleWhenEmpty="No LSTs Available"
        descriptionWhenEmpty="Create your own pool to get started!"
        getItemKey={(pool) => pool.id.toString()}
        renderItem={(pool) => <LstListItem pool={pool} isSelfStaked={false} />}
        onSelect={(pool) => {
          setLsPoolId(pool.id);
          setIsSelectTokenModalOpen(false);
        }}
        sorting={(a, b) => {
          // Sort pools by highest TVL in descending order.
          return b.totalStaked.sub(a.totalStaked).isNeg() ? -1 : 1;
        }}
        filterItem={(pool, query) => {
          const displayName: LsPoolDisplayName = `${pool.name}#${pool.id}`;

          return filterBy(query, [displayName]);
        }}
      />
    </Card>
  );
};

export default LsStakeCard;
