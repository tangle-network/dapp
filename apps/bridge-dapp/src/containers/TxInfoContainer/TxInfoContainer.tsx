import WalletFillIcon from '@webb-tools/icons/WalletFillIcon.js';
import TxInfoItem from '../../components/TxInfoItem/index.js';
import ShieldKeyholeFillIcon from '@webb-tools/icons/ShieldKeyholeFillIcon.js';

const TxInfoContainer = ({
  hasRefund,
  refundAmount,
  refundToken,
  newBalance,
  newBalanceToken,
  txType,
}: {
  hasRefund?: boolean;
  refundAmount?: string;
  refundToken?: string;
  newBalance?: number;
  newBalanceToken?: string;
  txType: 'deposit' | 'withdraw' | 'transfer';
}) => {
  return (
    <div className="space-y-2">
      {refundAmount && hasRefund && (
        <TxInfoItem
          leftContent={{
            title: 'Refund',
          }}
          rightIcon={<WalletFillIcon />}
          rightText={`${refundAmount.slice(0, 10)} ${refundToken ?? ''}`.trim()}
        />
      )}
      <TxInfoItem
        leftContent={{
          title: txType !== 'deposit' ? 'Remaining Balance' : 'New Balance',
        }}
        rightIcon={<ShieldKeyholeFillIcon />}
        rightText={
          typeof newBalance === 'number'
            ? `${newBalance.toString().slice(0, 10)} ${
                newBalanceToken ?? ''
              }`.trim()
            : '--'
        }
      />
    </div>
  );
};

export default TxInfoContainer;
