import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { ListItem } from '@webb-tools/webb-ui-components/components/ListCard/ListItem';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import { DelegatorInfo } from '../../../types/restake';
import ModalContent from '../ModalContent';
import ModalContentList from '../ModalContentList';

type Props = {
  delegatorInfo: DelegatorInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onItemSelected: (item: {
    assetId: string;
    amount: bigint;
    formattedAmount: string;
  }) => void;
};

const WithdrawModal = ({
  delegatorInfo,
  isOpen,
  onClose,
  onItemSelected,
}: Props) => {
  const { assetMap } = useRestakeContext();

  // Aggregate the delegations based on the operator account id and asset id
  const deposits = useMemo(() => {
    if (!delegatorInfo?.deposits) {
      return [];
    }

    return Object.entries(delegatorInfo.deposits).map(
      ([assetId, { amount }]) => ({
        assetId,
        amount,
      }),
    );
  }, [delegatorInfo]);

  return (
    <ModalContent
      isOpen={isOpen}
      title="Select Withdrawal Asset"
      description="Select the asset you want to withdraw"
      onInteractOutside={onClose}
    >
      <ModalContentList
        title="Select Withdrawal Asset"
        items={deposits}
        onClose={onClose}
        overrideSearchInputProps={{
          id: 'search-withdraw-asset',
          placeholder: 'Search Asset to Withdraw',
        }}
        searchFilter={({ amount, assetId }, searchText) => {
          if (!searchText) {
            return true;
          }

          const asset = assetMap[assetId];
          const assetSymbol = asset?.symbol || 'Unknown';

          return (
            assetSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
            amount.toString().includes(searchText)
          );
        }}
        renderEmpty={{
          title: 'No Asset Found',
          description:
            'You can try to deposit or delegate an asset to an operator.',
        }}
        renderItem={(item) => {
          const { amount, assetId } = item;
          const asset = assetMap[assetId];

          const decimals = asset?.decimals || DEFAULT_DECIMALS;
          const assetSymbol = asset?.symbol || 'Unknown';

          const fmtAmount = formatUnits(amount, decimals);

          return (
            <ListItem
              className={twMerge(
                'cursor-pointer max-w-none dark:bg-transparent',
                'flex items-center justify-between px-4',
              )}
              key={assetId}
              onClick={() =>
                onItemSelected({
                  ...item,
                  formattedAmount: fmtAmount,
                })
              }
            >
              <div className="flex items-center gap-2">
                <TokenIcon size="xl" name={assetSymbol} />

                <div>
                  <Typography variant="h5" fw="bold">
                    {assetSymbol}
                  </Typography>

                  <Typography
                    variant="body2"
                    className="text-mono-120 dark:text-mono-100"
                  >
                    Asset ID: {assetId}
                  </Typography>
                </div>
              </div>

              <div>
                <Typography ta="right" variant="h5" fw="bold">
                  {fmtAmount}
                </Typography>

                {asset.poolId && (
                  <Typography
                    ta="right"
                    variant="body3"
                    fw="semibold"
                    className="!text-mono-100 mt-1"
                  >
                    Pool ID: {asset.poolId}
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

export default WithdrawModal;
