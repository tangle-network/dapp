'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Search } from '@webb-tools/icons';
import {
  Button,
  Chip,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { z } from 'zod';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import {
  LsNetworkId,
  LsProtocolId,
  LsSearchParamKey,
} from '../../../constants/liquidStaking/types';
import useMintTx from '../../../data/liquidStaking/parachain/useMintTx';
import useLsPoolJoinTx from '../../../data/liquidStaking/tangle/useLsPoolJoinTx';
import useLsExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useLsExchangeRate';
import useLsPoolMembers from '../../../data/liquidStaking/useLsPoolMembers';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSearchParamState from '../../../hooks/useSearchParamState';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPercentage from '../../../utils/scaleAmountByPercentage';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import FeeDetailItem from './FeeDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsFeeWarning from './LsFeeWarning';
import LsInput from './LsInput';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import useLsChangeNetwork from './useLsChangeNetwork';
import useLsFeePercentage from './useLsFeePercentage';
import useLsSpendingLimits from './useLsSpendingLimits';

const LsStakeCard: FC = () => {
  const [fromAmount, setFromAmount] = useSearchParamState<BN | null>({
    defaultValue: null,
    key: LsSearchParamKey.AMOUNT,
    parser: (value) => new BN(value),
    stringify: (value) => value?.toString(),
  });

  const { lsProtocolId, setLsProtocolId, lsNetworkId, lsPoolId } = useLsStore();

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

  const actionText = useMemo(() => {
    const defaultText = 'Join Pool & Stake';

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

  return (
    <>
      <LsInput
        id="liquid-staking-stake-from"
        networkId={lsNetworkId}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${selectedProtocol.token}`}
        rightElement={walletBalance}
        setProtocolId={setLsProtocolId}
        minAmount={minSpendable ?? undefined}
        maxAmount={maxSpendable ?? undefined}
        setNetworkId={tryChangeNetwork}
        showPoolIndicator={false}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LsInput
        id="liquid-staking-stake-to"
        networkId={lsNetworkId}
        placeholder={`0 ${LS_DERIVATIVE_TOKEN_PREFIX}${selectedProtocol.token}`}
        decimals={selectedProtocol.decimals}
        amount={toAmount}
        isReadOnly
        isDerivativeVariant
        token={selectedProtocol.token}
        className={isRefreshingExchangeRate ? 'animate-pulse' : undefined}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
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
      </div>

      <LsFeeWarning isMinting selectedProtocolId={lsProtocolId} />

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
    </>
  );
};

type ParachainItem = {
  id: number;
  name: string;
  icon: string;
  isConnected: boolean;
};

type SelectParachainContentProps = {
  parachains: ParachainItem[];
};

// TODO: Not yet used. Exported on purpose to avoid getting warnings. However, this is a local component.
/** @internal */
export const SelectParachainContent: FC<SelectParachainContentProps> = ({
  parachains,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Typography variant="h5" fw="bold">
        Select Parachain
      </Typography>

      <Input
        id="select-parachain-content-search"
        placeholder="Search parachains..."
        rightIcon={<Search />}
      />

      <div className="flex flex-col gap-2 p-2">
        {parachains.map((parachain) => (
          <div
            key={parachain.id}
            className="flex items-center justify-between gap-1 px-4 py-3"
          >
            <div className="flex gap-2 items-center">
              <Typography variant="h5" fw="bold" className="dark:text-mono-0">
                {parachain.name}
              </Typography>
            </div>

            {parachain.isConnected && <Chip color="green">Connected</Chip>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LsStakeCard;
