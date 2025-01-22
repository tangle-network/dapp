// This will override global types and provide type definitions for
// the LST pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@webb-tools/icons';
import { Card } from '@webb-tools/webb-ui-components';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  LsNetworkId,
  LsPoolDisplayName,
} from '../../../constants/liquidStaking/types';
import useMintTx from '../../../data/liquidStaking/parachain/useMintTx';
import useLsPoolJoinTx from '../../../data/liquidStaking/tangle/useLsPoolJoinTx';
import useLsExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useLsExchangeRate';
import useAssetAccounts from '../../../data/liquidStaking/useAssetAccounts';
import useLsPools from '../../../data/liquidStaking/useLsPools';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPercentage from '../../../utils/scaleAmountByPercentage';
import DetailsContainer from '../../DetailsContainer';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import FeeDetailItem from './FeeDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsInput from './LsInput';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import useLsChangeNetwork from './useLsChangeNetwork';
import useLsFeePercentage from './useLsFeePercentage';
import useLsSpendingLimits from './useLsSpendingLimits';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import LstListItem from '../LstListItem';
import filterBy from '../../../utils/filterBy';

const LsStakeCard: FC = () => {
  const lsPools = useLsPools();
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  const { lsProtocolId, setLsProtocolId, lsNetworkId, lsPoolId, setLsPoolId } =
    useLsStore();

  const { execute: executeTanglePoolJoinTx, status: tanglePoolJoinTxStatus } =
    useLsPoolJoinTx();

  const { execute: executeParachainMintTx, status: parachainMintTxStatus } =
    useMintTx();

  const activeAccountAddress = useActiveAccountAddress();

  const { maxSpendable, minSpendable } = useLsSpendingLimits(
    true,
    lsProtocolId,
  );

  const selectedProtocol = getLsProtocolDef(lsProtocolId);
  const tryChangeNetwork = useLsChangeNetwork();
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

  const isTangleNetwork =
    lsNetworkId === LsNetworkId.TANGLE_LOCAL ||
    lsNetworkId === LsNetworkId.TANGLE_MAINNET ||
    lsNetworkId === LsNetworkId.TANGLE_TESTNET;

  const {
    exchangeRate: exchangeRateOrError,
    isRefreshing: isRefreshingExchangeRate,
  } = useLsExchangeRate(ExchangeRateType.NativeToDerivative);

  // TODO: Properly handle the error state.
  const exchangeRate =
    exchangeRateOrError instanceof Error ? null : exchangeRateOrError;

  const handleStakeClick = useCallback(async () => {
    // Not ready yet; no amount given.
    if (fromAmount === null) {
      return;
    }

    if (
      selectedProtocol.networkId === LsNetworkId.TANGLE_RESTAKING_PARACHAIN &&
      executeParachainMintTx !== null
    ) {
      executeParachainMintTx({
        amount: fromAmount,
        currency: selectedProtocol.currency,
      });
    } else if (
      isTangleNetwork &&
      executeTanglePoolJoinTx !== null &&
      lsPoolId !== null
    ) {
      executeTanglePoolJoinTx({
        amount: fromAmount,
        poolId: lsPoolId,
      });
    }
  }, [
    executeParachainMintTx,
    executeTanglePoolJoinTx,
    fromAmount,
    isTangleNetwork,
    selectedProtocol,
    lsPoolId,
  ]);

  const feePercentage = useLsFeePercentage(lsProtocolId, true);

  const toAmount = useMemo(() => {
    if (
      fromAmount === null ||
      exchangeRate === null ||
      typeof feePercentage !== 'number'
    ) {
      return null;
    }

    const feeAmount = scaleAmountByPercentage(fromAmount, feePercentage);

    return fromAmount.muln(exchangeRate).sub(feeAmount);
  }, [fromAmount, exchangeRate, feePercentage]);

  const canCallStake =
    (fromAmount !== null &&
      selectedProtocol.networkId === LsNetworkId.TANGLE_RESTAKING_PARACHAIN &&
      executeParachainMintTx !== null) ||
    (isTangleNetwork && executeTanglePoolJoinTx !== null && lsPoolId !== null);

  const walletBalance = (
    <LsAgnosticBalance
      tooltip="Available Balance"
      onClick={() => {
        if (maxSpendable !== null) {
          setFromAmount(maxSpendable);
        }
      }}
    />
  );

  // Reset the input amount when the network changes.
  useEffect(() => {
    setFromAmount(null);
  }, [setFromAmount, lsNetworkId]);

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
        networkId={lsNetworkId}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder="Enter amount to stake"
        rightElement={walletBalance}
        setProtocolId={setLsProtocolId}
        minAmount={minSpendable ?? undefined}
        maxAmount={maxSpendable ?? undefined}
        setNetworkId={tryChangeNetwork}
        showPoolIndicator={false}
      />

      <ArrowDownIcon className="self-center dark:fill-mono-0 w-7 h-7" />

      <LsInput
        id="liquid-staking-stake-to"
        networkId={lsNetworkId}
        placeholder={EMPTY_VALUE_PLACEHOLDER}
        decimals={selectedProtocol.decimals}
        amount={toAmount}
        isReadOnly
        isDerivativeVariant
        token={selectedProtocol.token}
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
        className={isRefreshingExchangeRate ? 'animate-pulse' : undefined}
      />

      {/* Details */}
      <DetailsContainer>
        <UnstakePeriodDetailItem protocolId={lsProtocolId} />

        <ExchangeRateDetailItem
          token={selectedProtocol.token}
          type={ExchangeRateType.NativeToDerivative}
        />

        <FeeDetailItem
          inputAmount={fromAmount}
          isStaking
          protocolId={lsProtocolId}
        />
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
        isLoading={
          parachainMintTxStatus === TxStatus.PROCESSING ||
          tanglePoolJoinTxStatus === TxStatus.PROCESSING
        }
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
