'use client';

import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import LockFillIcon from '@webb-tools/icons/LockFillIcon';
import { LockLineIcon } from '@webb-tools/icons/LockLineIcon';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { ListItem } from '@webb-tools/webb-ui-components/components/ListCard/ListItem';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';
import type { Writeable } from 'zod';

import RestakeDetailCard from '../../../components/RestakeDetailCard';
import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import useIdentities from '../../../data/useIdentities';
import ActionButtonBase from '../ActionButtonBase';
import AssetPlaceholder from '../AssetPlaceholder';
import AvatarWithText from '../AvatarWithText';
import ModalContent from '../ModalContent';
import ModalContentList from '../ModalContentList';
import RestakeTabs from '../RestakeTabs';
import TxInfo from './TxInfo';

export const dynamic = 'force-static';

const Page = () => {
  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
  } = useModal();

  const { assetMap } = useRestakeContext();
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const { result: identities } = useIdentities(
    useMemo(
      () =>
        delegatorInfo?.delegations?.map((item) => item.operatorAccountId) ?? [],
      [delegatorInfo?.delegations],
    ),
  );

  // Aggregate the delegations based on the operator account id and asset id
  const delegations = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations)) {
      return [];
    }

    return delegatorInfo.delegations.reduce(
      (acc, item) => {
        const { operatorAccountId, assetId, amountBonded } = item;

        const existingDelegation = acc.find(
          (delegation) =>
            delegation.operatorAccountId === operatorAccountId &&
            delegation.assetId === assetId,
        );

        if (existingDelegation) {
          existingDelegation.amountBonded += amountBonded;
        } else {
          acc.push({
            operatorAccountId,
            assetId,
            amountBonded,
          });
        }

        return acc;
      },
      [] as Writeable<NonNullable<typeof delegatorInfo.delegations>[number]>[],
    );
  }, [delegatorInfo]);

  return (
    <div className="grid items-start grid-cols-1 gap-4 sm:grid-cols-2 sm:justify-around">
      <div className="w-full max-w-lg mx-auto">
        <RestakeTabs />

        <form className="space-y-4" action="">
          <TransactionInputCard.Root>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                placeholder="Select"
                onClick={openOperatorModal}
              />
              <TransactionInputCard.MaxAmountButton
                tooltipBody="Staked Balance"
                Icon={
                  useRef({
                    enabled: <LockLineIcon />,
                    disabled: <LockFillIcon />,
                  }).current
                }
              />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={
                useRef({
                  placeholder: <AssetPlaceholder />,
                  isDisabled: true,
                }).current
              }
            />
          </TransactionInputCard.Root>

          <TxInfo />

          <ActionButtonBase>
            {(isLoading, loadingText) => {
              return (
                <Button
                  isFullWidth
                  type="submit"
                  isLoading={isLoading}
                  loadingText={loadingText}
                >
                  Schedule Unstake
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </div>

      {/** Hardcoded for the margin top to ensure the component is align to same card content */}
      <RestakeDetailCard.Root className="max-w-lg mx-auto sm:mt-[61px]">
        <RestakeDetailCard.Header title="No unstake requests found" />

        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          You will be able to withdraw your tokens after the unstake request has
          been processed. To unstake your tokens go to the unstake tab to
          schedule request.
        </Typography>
      </RestakeDetailCard.Root>

      <Modal>
        <ModalContent
          isOpen={isOperatorModalOpen}
          title="Select Operator"
          description="Select the operator you want to unstake from"
          onInteractOutside={closeOperatorModal}
        >
          <ModalContentList
            title="Select Operator"
            items={delegations}
            onClose={closeOperatorModal}
            overrideSearchInputProps={{
              id: 'search-unstake-operator',
              placeholder: 'Search Operator to Unstake',
            }}
            searchFilter={({ assetId, operatorAccountId }, searchText) => {
              if (!searchText) {
                return true;
              }

              const asset = assetMap[assetId];
              const assetSymbol = asset?.symbol || 'Unknown';
              const identityName = identities?.[operatorAccountId]?.name || '';

              return (
                operatorAccountId
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                assetSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
                (identityName
                  ? identityName
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                  : false)
              );
            }}
            renderEmpty={{
              title: 'No Delegation Found',
              description:
                'You can try to deposit or delegate an asset to an operator.',
            }}
            renderItem={({ amountBonded, assetId, operatorAccountId }) => {
              const asset = assetMap[assetId];

              const decimals = asset?.decimals || DEFAULT_DECIMALS;
              const assetSymbol = asset?.symbol || 'Unknown';

              const fmtAmount = formatUnits(amountBonded, decimals);

              return (
                <ListItem
                  className={twMerge(
                    'cursor-pointer max-w-none dark:bg-transparent',
                    'flex items-center justify-between px-0',
                  )}
                  key={`${operatorAccountId}-${assetId}`}
                >
                  <AvatarWithText
                    accountAddress={operatorAccountId}
                    overrideAvatarProps={{ size: 'lg' }}
                    overrideTypographyProps={{ variant: 'h5' }}
                    identityName={
                      identities?.[operatorAccountId]?.name || '<Unknown>'
                    }
                    description={
                      <KeyValueWithButton
                        size="sm"
                        keyValue={operatorAccountId}
                      />
                    }
                  />

                  <Typography variant="h5" fw="bold">
                    {fmtAmount} {assetSymbol}
                  </Typography>
                </ListItem>
              );
            }}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
