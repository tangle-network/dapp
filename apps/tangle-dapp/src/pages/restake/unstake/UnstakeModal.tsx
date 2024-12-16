import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import type { IdentityType } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { ListItem } from '@webb-tools/webb-ui-components/components/ListCard/ListItem';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import ModalContent from '../ModalContent';
import ModalContentList from '../ModalContentList';

type Props = {
  delegatorInfo: DelegatorInfo | null;
  operatorIdentities?: Record<string, IdentityType | null> | null;
  isOpen: boolean;
  onClose: () => void;
  onItemSelected: (
    item: DelegatorInfo['delegations'][number] & {
      formattedAmount: string;
    },
  ) => void;
};

const UnstakeModal = ({
  delegatorInfo,
  isOpen,
  onClose,
  onItemSelected,
  operatorIdentities,
}: Props) => {
  const { assetMap } = useRestakeContext();

  // Aggregate the delegations based on the operator account id and asset id
  const delegations = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations)) {
      return [];
    }

    return delegatorInfo.delegations;
  }, [delegatorInfo]);

  return (
    <ModalContent
      isOpen={isOpen}
      title="Select Operator"
      description="Select the operator you want to unstake from"
      onInteractOutside={onClose}
    >
      <ModalContentList
        title="Select Operator"
        items={delegations}
        onClose={onClose}
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
          const identityName =
            operatorIdentities?.[operatorAccountId]?.name || '';

          return (
            operatorAccountId
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            assetSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
            (identityName
              ? identityName.toLowerCase().includes(searchText.toLowerCase())
              : false)
          );
        }}
        renderEmpty={{
          title: 'No Delegation Found',
          description:
            'You can try to deposit or delegate an asset to an operator.',
        }}
        renderItem={(item) => {
          const { amountBonded, assetId, operatorAccountId } = item;
          const asset = assetMap[assetId];

          const decimals = asset?.decimals || DEFAULT_DECIMALS;
          const assetSymbol = asset?.symbol || 'Unknown';

          const fmtAmount = formatUnits(amountBonded, decimals);

          return (
            <ListItem
              className={twMerge(
                'cursor-pointer max-w-none dark:bg-transparent',
                'flex items-center justify-between px-4',
              )}
              key={`${operatorAccountId}-${assetId}`}
              onClick={() =>
                onItemSelected({
                  ...item,
                  formattedAmount: fmtAmount,
                })
              }
            >
              <AvatarWithText
                accountAddress={operatorAccountId}
                overrideAvatarProps={{ size: 'lg' }}
                overrideTypographyProps={{ variant: 'h5' }}
                identityName={
                  operatorIdentities?.[operatorAccountId]?.name || '<Unknown>'
                }
                description={
                  <KeyValueWithButton size="sm" keyValue={operatorAccountId} />
                }
              />

              <div>
                <Typography variant="h5" fw="bold">
                  {fmtAmount} {assetSymbol}
                </Typography>

                {asset.vaultId && (
                  <Typography
                    ta="right"
                    variant="body3"
                    fw="semibold"
                    className="!text-mono-100 mt-1"
                  >
                    Vault ID: {asset.vaultId}
                  </Typography>
                )}
              </div>
            </ListItem>
          );
        }}
      />
    </ModalContent>
  );
};

export default UnstakeModal;
