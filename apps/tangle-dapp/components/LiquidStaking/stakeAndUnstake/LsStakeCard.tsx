'use client';

// This will override global types and provide type definitions for
// the LST pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@webb-tools/icons';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';

import {
  LsNetworkId,
  LsSearchParamKey,
} from '../../../constants/liquidStaking/types';
import useMintTx from '../../../data/liquidStaking/parachain/useMintTx';
import useLsPoolJoinTx from '../../../data/liquidStaking/tangle/useLsPoolJoinTx';
import useLsExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useLsExchangeRate';
import useLsPoolMembers from '../../../data/liquidStaking/useLsPoolMembers';
import useLsPools from '../../../data/liquidStaking/useLsPools';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSearchParamState from '../../../hooks/useSearchParamState';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPercentage from '../../../utils/scaleAmountByPercentage';
import Container from '../../Container';
import DetailsContainer from '../../DetailsContainer';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import FeeDetailItem from './FeeDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsInput from './LsInput';
import LsSelectLstModal from './LsSelectLstModal';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import useLsChangeNetwork from './useLsChangeNetwork';
import useLsFeePercentage from './useLsFeePercentage';
import useLsSpendingLimits from './useLsSpendingLimits';

const LsStakeCard: FC = () => {
  const lsPools = useLsPools();
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);

  const [fromAmount, setFromAmount] = useSearchParamState<BN | null>({
    defaultValue: null,
    key: LsSearchParamKey.AMOUNT,
    parser: (value) => new BN(value),
    stringify: (value) => value?.toString(),
  });

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
  const lsPoolMembers = useLsPoolMembers();
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

  // TODO: Not loading the correct protocol for: '?amount=123000000000000000000&protocol=7&network=1&action=stake'. When network=1, it switches to protocol=5 on load. Could this be because the protocol is reset to its default once the network is switched?
  useSearchParamSync({
    key: LsSearchParamKey.PROTOCOL_ID,
    value: lsProtocolId,
    parse: (value) => z.nativeEnum(LsProtocolId).parse(parseInt(value)),
    stringify: (value) => value.toString(),
    setValue: setLsProtocolId,
  });

  useSearchParamSync({
    key: LsSearchParamKey.NETWORK_ID,
    value: lsNetworkId,
    parse: (value) => z.nativeEnum(LsNetworkId).parse(parseInt(value)),
    stringify: (value) => value.toString(),
    // TODO: This might be causing many requests to try to change the network. Bug.
    setValue: tryChangeNetwork,
  });

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
      tooltip="Click to use all available balance"
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
    <Container className="flex flex-col items-stretch justify-center gap-2">
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
        loadingText="Processing"
        onClick={handleStakeClick}
        isFullWidth
      >
        {actionText}
      </Button>

      <LsSelectLstModal
        pools={allPools}
        isOpen={isSelectTokenModalOpen}
        setIsOpen={setIsSelectTokenModalOpen}
        onSelect={setLsPoolId}
      />
    </Container>
  );
};

export default LsStakeCard;
