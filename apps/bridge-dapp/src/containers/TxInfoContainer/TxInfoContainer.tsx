import WalletFillIcon from '@webb-tools/icons/WalletFillIcon';
import TxInfoItem from '../../components/TxInfoItem';
import ShieldKeyholeFillIcon from '@webb-tools/icons/ShieldKeyholeFillIcon';

const TxInfoContainer = ({
  hasRefund,
  refundAmount,
  refundToken,
  remaining,
  remainingToken,
}: {
  hasRefund?: boolean;
  refundAmount?: string;
  refundToken?: string;
  remaining?: number;
  remainingToken?: string;
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
          title: 'Remaining Balance',
        }}
        rightIcon={<ShieldKeyholeFillIcon />}
        rightText={
          typeof remaining === 'number'
            ? `${remaining.toString().slice(0, 10)} ${
                remainingToken ?? ''
              }`.trim()
            : '--'
        }
      />
    </div>
  );
};

export default TxInfoContainer;
