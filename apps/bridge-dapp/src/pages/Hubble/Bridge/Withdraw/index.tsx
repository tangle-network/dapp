import cx from 'classnames';
import {
  ArrowRight,
  AccountCircleLineIcon,
  ClipboardLineIcon,
  GasStationFill,
} from '@webb-tools/icons';
import {
  TransactionInputCard,
  TitleWithInfo,
  TextField,
  ToggleCard,
  FeeDetails,
  Button,
  IconWithTooltip,
} from '@webb-tools/webb-ui-components';
import { useMemo, useState } from 'react';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import { Transition } from '@headlessui/react';
import { useSearchParams } from 'react-router-dom';
import { DEST_CHAIN_KEY, TOKEN_KEY } from '../../../../constants';

const TOKEN_NAME = 'Matic';
const CHAIN_NAME = 'Polygon Mumbai';

const Withdraw = () => {
  const [hasRefund, setHasRefund] = useState(false);

  const [searchParams] = useSearchParams();

  const [destTypedChainId, poolId, tokenId] = useMemo(() => {
    const destTypedId = parseInt(searchParams.get(DEST_CHAIN_KEY) ?? '');

    const poolId = parseInt(searchParams.get('poolId') ?? '');
    const tokenId = parseInt(searchParams.get(TOKEN_KEY) ?? '');

    return [
      Number.isNaN(destTypedId) ? undefined : destTypedId,
      Number.isNaN(poolId) ? undefined : poolId,
      Number.isNaN(tokenId) ? undefined : tokenId,
    ];
  }, [searchParams]);

  return (
    <BridgeTabsContainer>
      <div className="flex flex-col space-y-4 grow">
        <div className="space-y-2">
          <TransactionInputCard.Root typedChainId={destTypedChainId}>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root typedChainId={destTypedChainId}>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body />
          </TransactionInputCard.Root>

          <div className="flex gap-2">
            <div
              className={cx(
                'transition-[flex-grow] ease-in-out duration-200 space-y-2',
                {
                  'grow-0': hasRefund,
                  grow: !hasRefund,
                }
              )}
            >
              <TitleWithInfo
                title="Recipient Shielded Account"
                info="Recipient Shielded Account"
              />

              <TextField.Root className="max-w-none">
                <TextField.Input placeholder="0x..." />

                <TextField.Slot>
                  <IconWithTooltip
                    icon={
                      <AccountCircleLineIcon
                        size="lg"
                        className="!fill-current"
                      />
                    }
                    content="Send to self"
                  />
                  <IconWithTooltip
                    icon={
                      <ClipboardLineIcon size="lg" className="!fill-current" />
                    }
                    content="Patse from clipboard"
                  />
                </TextField.Slot>
              </TextField.Root>
            </div>

            <Transition
              className="space-y-2"
              show={hasRefund}
              enter="transition-opacity duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <TitleWithInfo
                title="Refund Wallet Address"
                info="Refund Wallet"
              />

              <TextField.Root className="max-w-none">
                <TextField.Input placeholder="0x..." />

                <TextField.Slot>
                  <IconWithTooltip
                    icon={
                      <AccountCircleLineIcon
                        size="lg"
                        className="!fill-current"
                      />
                    }
                    content="Send to self"
                  />
                  <IconWithTooltip
                    icon={
                      <ClipboardLineIcon size="lg" className="!fill-current" />
                    }
                    content="Patse from clipboard"
                  />
                </TextField.Slot>
              </TextField.Root>
            </Transition>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <div className="space-y-4">
            <ToggleCard
              title="Enable refund"
              info="Refund"
              Icon={<GasStationFill size="lg" />}
              description={`Get ${TOKEN_NAME} on transactions on ${CHAIN_NAME}`}
              className="max-w-none"
              switcherProps={{
                checked: hasRefund,
                onCheckedChange: setHasRefund,
              }}
            />

            <FeeDetails />
          </div>

          <Button isFullWidth>Transfer</Button>
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Withdraw;
