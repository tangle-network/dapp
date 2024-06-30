'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { InformationLine } from '@webb-tools/icons';
import {
  Button,
  IconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChain,
  LS_CHAIN_TO_TOKEN,
  LS_TOKEN_TO_CURRENCY,
} from '../../constants/liquidStaking';
import useRedeemTx from '../../data/liquidStaking/useRedeemTx';
import useApi from '../../hooks/useApi';
import useApiRx from '../../hooks/useApiRx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import LiquidStakingInput from './LiquidStakingInput';
import WalletBalance from './WalletBalance';

const LiquidUnstakeCard: FC = () => {
  const [toAmount, setToAmount] = useState<BN | null>(null);

  // TODO: The rate will likely be a hook on its own, likely needs to be extracted from the Tangle Restaking Parachain via a query/subscription.
  const [rate] = useState<number | null>(1.0);

  const [selectedChain, setSelectedChain] = useState<LiquidStakingChain>(
    LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN,
  );

  const { execute: executeRedeemTx, status: redeemTxStatus } = useRedeemTx();

  const selectedChainToken = LS_CHAIN_TO_TOKEN[selectedChain];

  const { result: minimumRedeemAmount } = useApiRx(
    useCallback(
      (api) =>
        api.query.lstMinting.minimumRedeem({
          Native: LS_TOKEN_TO_CURRENCY[selectedChainToken],
        }),
      [selectedChainToken],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: existentialDepositAmount } = useApi(
    useCallback((api) => api.consts.balances.existentialDeposit, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const minimumInputAmount = useMemo(() => {
    if (minimumRedeemAmount === null || existentialDepositAmount === null) {
      return null;
    }

    return BN.max(minimumRedeemAmount, existentialDepositAmount);
  }, [existentialDepositAmount, minimumRedeemAmount]);

  const handleUnstakeClick = useCallback(() => {
    if (executeRedeemTx === null || toAmount === null) {
      return;
    }

    executeRedeemTx({
      amount: toAmount,
      currency: LS_TOKEN_TO_CURRENCY[selectedChainToken],
    });
  }, [executeRedeemTx, toAmount, selectedChainToken]);

  const fromAmount = useMemo(() => {
    if (toAmount === null || rate === null) {
      return null;
    }

    return toAmount.muln(rate);
  }, [toAmount, rate]);

  return (
    <>
      <LiquidStakingInput
        id="liquid-staking-unstake-from"
        chain={selectedChain}
        token={LS_CHAIN_TO_TOKEN[selectedChain]}
        amount={toAmount}
        setAmount={setToAmount}
        placeholder={`0 ${selectedChainToken}`}
        rightElement={<WalletBalance />}
        isReadOnly
        setChain={setSelectedChain}
        minAmount={minimumInputAmount ?? undefined}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-unstake-to"
        chain={LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN}
        placeholder={`0 ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChainToken}`}
        amount={fromAmount}
        isTokenLiquidVariant
        token={LS_CHAIN_TO_TOKEN[selectedChain]}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 bg-mono-20 dark:bg-mono-180 rounded-lg">
        <DetailItem
          title="Rate"
          tooltip="This is a test."
          value={`1 ${selectedChainToken} = ${rate} ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChainToken}`}
        />

        <DetailItem
          title="Cross-chain fee"
          tooltip="This is a test."
          value={`0.001984 ${selectedChainToken}`}
        />

        <DetailItem
          title="Unstake period"
          tooltip="The period of time you need to wait before you can unstake your tokens."
          value="7 days"
        />
      </div>

      <Button
        isDisabled={
          executeRedeemTx === null || toAmount === null || toAmount.isZero()
        }
        isLoading={redeemTxStatus === TxStatus.PROCESSING}
        loadingText="Processing"
        onClick={handleUnstakeClick}
        isFullWidth
      >
        Unstake
      </Button>
    </>
  );
};

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: string;
};

/** @internal */
const DetailItem: FC<DetailItemProps> = ({ title, tooltip, value }) => {
  return (
    <div className="flex gap-2 justify-between w-full">
      <div className="flex items-center gap-1">
        <Typography variant="body1" fw="normal">
          {title}
        </Typography>

        {tooltip !== undefined && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-140 dark:fill-mono-100" />
            }
            content={tooltip}
            overrideTooltipBodyProps={{
              className: 'max-w-[350px]',
            }}
          />
        )}
      </div>

      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        {value}
      </Typography>
    </div>
  );
};

export default LiquidUnstakeCard;
