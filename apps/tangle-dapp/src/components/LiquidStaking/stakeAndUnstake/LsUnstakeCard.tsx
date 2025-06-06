import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Button, Card } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LsPool,
  LsPoolDisplayName,
} from '../../../constants/liquidStaking/types';
import useLsPoolUnbondTx from '../../../data/liquidStaking/tangle/useLsPoolUnbondTx';
import useLsExchangeRate from '../../../data/liquidStaking/useLsExchangeRate';
import useLsMyPools from '../../../data/liquidStaking/useLsMyPools';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useIsAccountConnected from '@tangle-network/tangle-shared-ui/hooks/useIsAccountConnected';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsInput from './LsInput';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import LstListItem from '../LstListItem';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useLsAgnosticBalance from './useLsAgnosticBalance';

const LsUnstakeCard: FC = () => {
  const isAccountConnected = useIsAccountConnected();
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);
  const activeAccountAddress = useActiveAccountAddress();
  const fromLsInputRef = useRef<HTMLInputElement>(null);
  const myPools = useLsMyPools();

  // Map the pools to replace the total staked property with the
  // self stake property instead. This is so that the Select LST
  // modal shows the self stake amount instead of the total staked,
  // which is more relevant when unstaking.
  const myPoolsWithSelfStake = useMemo<LsPool[] | null>(() => {
    if (myPools === null) {
      return null;
    }

    return myPools.map((pool) => ({ ...pool, staked: pool.myStake }));
  }, [myPools]);

  const { lsPoolId, setLsPoolId } = useLsStore();

  const { execute: executeTangleUnbondTx, status: tangleUnbondTxStatus } =
    useLsPoolUnbondTx();

  const exchangeRate = useLsExchangeRate();

  const handleUnstakeClick = useCallback(async () => {
    // Cannot perform transaction: Amount not set.
    if (fromAmount === null) {
      return;
    }

    if (executeTangleUnbondTx !== null && lsPoolId !== null) {
      return executeTangleUnbondTx({
        points: fromAmount,
        poolId: lsPoolId,
      });
    }
  }, [executeTangleUnbondTx, fromAmount, lsPoolId]);

  const toAmount = useMemo(() => {
    if (
      fromAmount === null ||
      exchangeRate === null ||
      exchangeRate === undefined
    ) {
      return null;
    }

    return fromAmount.divn(exchangeRate);
  }, [exchangeRate, fromAmount]);

  // Reset the input amount when the network changes.
  useEffect(() => {
    setFromAmount(null);
  }, [setFromAmount]);

  // Reset the input amount when the transaction is processed.
  useEffect(() => {
    if (tangleUnbondTxStatus === TxStatus.COMPLETE) {
      setFromAmount(null);
    }
  }, [setFromAmount, tangleUnbondTxStatus]);

  // On mount, set the focus on the from input.
  useEffect(() => {
    if (fromLsInputRef.current !== null) {
      fromLsInputRef.current.focus();
    }
  }, []);

  const balance = useLsAgnosticBalance(false);

  const stakedWalletBalance = (
    <LsAgnosticBalance
      isNative={false}
      tooltip="Available Balance"
      onClick={() => {
        if (balance instanceof BN) {
          setFromAmount(balance);
        }
      }}
    />
  );

  const canCallUnstake = executeTangleUnbondTx !== null && lsPoolId !== null;

  return (
    <>
      <Card
        withShadow
        tightPadding
        className="flex flex-col items-stretch justify-center gap-2"
      >
        {/* TODO: Have a way to trigger a refresh of the amount once the wallet balance (max) button is clicked. Need to signal to the liquid staking input to update its display amount based on the `fromAmount` prop. */}
        <LsInput
          ref={fromLsInputRef}
          id="liquid-staking-unstake-from"
          amount={fromAmount}
          onAmountChange={setFromAmount}
          placeholder="Enter amount to unstake"
          rightElement={stakedWalletBalance}
          isDerivativeVariant
          maxAmount={balance instanceof BN ? balance : undefined}
          maxErrorMessage="Not enough stake to redeem"
          // Disable the token click if there's no account connected
          // since it won't be possible to fetch the user's pools
          // then.
          onTokenClick={
            isAccountConnected
              ? () => setIsSelectTokenModalOpen(true)
              : undefined
          }
        />

        <ArrowDownIcon className="self-center dark:fill-mono-0 w-7 h-7" />

        <LsInput
          id="liquid-staking-unstake-to"
          amount={toAmount}
          placeholder={EMPTY_VALUE_PLACEHOLDER}
          isReadOnly
          showPoolIndicator={false}
        />

        {/* Details */}
        <div className="flex flex-col gap-2 p-3">
          <UnstakePeriodDetailItem />

          <ExchangeRateDetailItem />
        </div>

        <Button
          isDisabled={
            // No active account.
            activeAccountAddress === null ||
            !canCallUnstake ||
            // Amount not yet provided or is zero.
            fromAmount === null ||
            fromAmount.isZero()
          }
          isLoading={tangleUnbondTxStatus === TxStatus.PROCESSING}
          onClick={handleUnstakeClick}
          isFullWidth
        >
          Schedule Unstake
        </Button>
      </Card>

      <ListModal
        title="Select LST"
        searchInputId="ls-unstake-select-lst-search"
        searchPlaceholder="Search liquid staking tokens by name or ID..."
        items={myPoolsWithSelfStake}
        isOpen={isSelectTokenModalOpen}
        setIsOpen={setIsSelectTokenModalOpen}
        titleWhenEmpty="Nothing to Unstake"
        descriptionWhenEmpty="This account hasn't staked in any pools yet."
        getItemKey={(pool) => pool.id.toString()}
        renderItem={(pool) => <LstListItem pool={pool} isSelfStaked />}
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

          return displayName.toLowerCase().includes(query.toLowerCase());
        }}
      />
    </>
  );
};

export default LsUnstakeCard;
