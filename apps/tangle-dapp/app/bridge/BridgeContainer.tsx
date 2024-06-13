'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import InfoIconWithTooltip from '@webb-tools/webb-ui-components/components/IconWithTooltip/InfoIconWithTooltip';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import AddressInput, {
  AddressType,
} from '../../components/AddressInput/AddressInput';
import { useBridge } from '../../context/BridgeContext';
import { isEVMChain } from '../../utils/bridge';
import AmountAndTokenInput from './AmountAndTokenInput';
import ChainSelectors from './ChainSelectors';
import useActionButton from './hooks/useActionButton';
import useBridgeFee from './hooks/useBridgeFee';
import useEstimatedGasFee from './hooks/useEstimatedGasFee';
import useSelectedToken from './hooks/useSelectedToken';
import useTypedChainId from './hooks/useTypedChainId';

interface BridgeContainerProps {
  className?: string;
}

const BridgeContainer: FC<BridgeContainerProps> = ({ className }) => {
  const {
    selectedSourceChain,
    selectedDestinationChain,
    destinationAddress,
    setDestinationAddress,
    setIsAddressInputError,
  } = useBridge();
  const { buttonAction, buttonText, isLoading, isDisabled, errorMessage } =
    useActionButton();
  const { fee: bridgeFee, isLoading: isLoadingBridgeFee } = useBridgeFee();
  const { fee: estimatedGasFee, isLoading: isLoadingEstimatedGasFee } =
    useEstimatedGasFee();
  const selectedToken = useSelectedToken();
  const { destinationTypedChainId } = useTypedChainId();

  const destChainTransactionFee = useMemo(
    () =>
      selectedToken.destChainTransactionFee[destinationTypedChainId] ?? null,
    [destinationTypedChainId, selectedToken.destChainTransactionFee],
  );

  const totalFeeCmp = useMemo(() => {
    if (bridgeFee === null || estimatedGasFee === null) return null;

    const allTokenFee = bridgeFee.add(
      destChainTransactionFee ?? new Decimal(0),
    );

    if (
      selectedToken.symbol.toLowerCase() ===
      selectedSourceChain.nativeCurrency.symbol.toLowerCase()
    ) {
      const totalFee = allTokenFee.add(estimatedGasFee);
      if (totalFee.isZero()) return null;
      return `${totalFee.toString()} ${selectedToken.symbol}`;
    }

    return `${allTokenFee.toString()} ${selectedToken.symbol} + ${estimatedGasFee.toString()} ${selectedSourceChain.nativeCurrency.symbol}`;
  }, [
    bridgeFee,
    destChainTransactionFee,
    selectedToken.symbol,
    estimatedGasFee,
    selectedSourceChain.nativeCurrency.symbol,
  ]);

  return (
    <div
      className={twMerge(
        'max-w-[640px] min-h-[580px] bg-mono-0 dark:bg-mono-190 p-5 md:p-8',
        'rounded-xl border border-mono-40 dark:border-mono-160',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        'flex flex-col',
        className,
      )}
    >
      <div className="flex-1 w-full flex flex-col justify-between">
        <div className="space-y-10">
          <ChainSelectors />

          <AmountAndTokenInput />

          <AddressInput
            id="bridge-destination-address-input"
            type={
              isEVMChain(selectedDestinationChain)
                ? AddressType.EVM
                : AddressType.Substrate
            }
            title="Receiver Address"
            baseInputOverrides={{ isFullWidth: true }}
            value={destinationAddress}
            setValue={setDestinationAddress}
            setErrorMessage={(error) =>
              setIsAddressInputError(error ? true : false)
            }
          />

          <FeeDetails
            title="Total Fees"
            totalFeeCmp={totalFeeCmp}
            isTotalLoading={isLoadingBridgeFee || isLoadingEstimatedGasFee}
            items={
              [
                bridgeFee !== null
                  ? {
                      name: 'Bridge Fee',
                      value: (
                        <FeeValueCmp
                          fee={bridgeFee}
                          symbol={selectedToken.symbol}
                        />
                      ),
                      isLoading: isLoadingBridgeFee,
                      info: 'This transaction will charge a bridge fee to cover the destination chain’s gas fee.',
                    }
                  : undefined,
                destChainTransactionFee !== null
                  ? {
                      name: 'Bridge Fee',
                      value: (
                        <FeeValueCmp
                          fee={destChainTransactionFee}
                          symbol={selectedToken.symbol}
                        />
                      ),
                      info: 'This fee is used to pay the XCM fee of the destination chain.',
                    }
                  : undefined,
                estimatedGasFee !== null
                  ? {
                      name: 'Estimated Gas Fee',
                      value: (
                        <FeeValueCmp
                          fee={estimatedGasFee}
                          symbol={selectedSourceChain.nativeCurrency.symbol}
                        />
                      ),
                      isLoading: isLoadingEstimatedGasFee,
                    }
                  : undefined,
              ].filter((item) => Boolean(item)) as Array<FeeItem>
            }
            className="!bg-mono-20 dark:!bg-mono-160"
            titleClassName="!text-mono-100 dark:!text-mono-80"
            itemTitleClassName="!text-mono-100 dark:!text-mono-80"
          />
        </div>
        <div className="flex flex-col items-end gap-2">
          {errorMessage && (
            <div className="flex items-center gap-1">
              <Typography
                variant="body2"
                className="text-red-70 dark:text-red-50"
              >
                * {errorMessage.text}
              </Typography>
              {errorMessage.tooltip && (
                <InfoIconWithTooltip
                  content={errorMessage.tooltip}
                  className="fill-red-70 dark:fill-red-50"
                  overrideTooltipBodyProps={{ className: 'max-w-[200px]' }}
                />
              )}
            </div>
          )}
          <Button
            isFullWidth
            isDisabled={isDisabled}
            isLoading={isLoading}
            onClick={buttonAction}
            loadingText="Connecting..."
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BridgeContainer;

const FeeValueCmp: FC<{ fee: Decimal; symbol: string }> = ({ fee, symbol }) => {
  return (
    <Typography
      variant="body1"
      className="!text-mono-120 dark:!text-mono-100"
    >{`${fee.toString()} ${symbol}`}</Typography>
  );
};
