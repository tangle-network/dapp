import { DepositCard, TransferCard, WithdrawCard } from '@nepoche/webb-ui-components/containers';
import { Typography } from '@nepoche/webb-ui-components/typography';

const BridgeControlShowcase = () => {
  return (
    <div className='p-4 space-y-10 justify-items-stretch bg-mono-0 dark:bg-mono-200 rounded-xl'>
      <div>
        <Typography variant='h3' ta='center' fw='bold' className='mb-4'>
          Withdraw Card
        </Typography>
        <WithdrawCard className='mx-auto' />
      </div>

      <div>
        <Typography variant='h3' ta='center' fw='bold' className='mb-4'>
          Deposit Card
        </Typography>
        <DepositCard className='mx-auto' buttonProps={{ children: 'Connect wallet' }} />
      </div>

      <div>
        <Typography variant='h3' ta='center' fw='bold' className='mb-4'>
          Transfer Card
        </Typography>
        <TransferCard className='mx-auto' />
      </div>
    </div>
  );
};

export default BridgeControlShowcase;