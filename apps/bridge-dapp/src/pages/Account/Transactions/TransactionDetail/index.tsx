import { type FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TransactionType } from '@webb-tools/abstract-api-provider';
import { useTxClientStorage } from '@webb-tools/api-provider-environment';

import TxDetailContainer from '../../../../containers/TxDetailContainer';
import { ACCOUNT_TRANSACTIONS_FULL_PATH } from '../../../../constants';

const TransactionDetail: FC = () => {
  const navigate = useNavigate();

  const [txDetail, setTxDetail] = useState<TransactionType | undefined>();
  const { txHash = '' } = useParams<{ txHash: string }>();

  const { getTxDetailByHash } = useTxClientStorage();

  useEffect(() => {
    const getTxDetail = async () => {
      const txDetail = await getTxDetailByHash(txHash);
      setTxDetail(txDetail);
    };

    getTxDetail();
  }, [txHash]);

  if (!txDetail) {
    return null;
  }

  return (
    <Drawer
      defaultOpen
      onOpenChange={(isOpen) =>
        !isOpen && navigate(ACCOUNT_TRANSACTIONS_FULL_PATH)
      }
    >
      <DrawerContent className="!w-[500px] flex flex-col justify-between dark:bg-mono-190">
        {/* Header */}
        <div className="px-9 pt-9 pb-4 flex items-center justify-between">
          <Typography variant="h5" fw="semibold">
            {/* TODO: Update to match with tx activity (Ex: Deposit Details) */}
            Transaction Details
          </Typography>
          <DrawerCloseButton />
        </div>

        {/* Content */}
        <TxDetailContainer {...txDetail} />

        {/* Footer */}
        <div className="px-9 py-6 flex flex-col gap-2 border-t border-mono-60 dark:border-mono-160">
          {/* TODO: Explorer Link */}
          <Button isFullWidth>View on Explorer</Button>
          <Button
            variant="secondary"
            isFullWidth
            onClick={() => {
              navigate(ACCOUNT_TRANSACTIONS_FULL_PATH);
            }}
          >
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionDetail;
