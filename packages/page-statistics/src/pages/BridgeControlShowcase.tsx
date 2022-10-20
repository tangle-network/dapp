import { DepositCard, DepositConfirm, TransferCard, WithdrawCard } from '@webb-dapp/webb-ui-components/containers';
import { Typography } from '@webb-dapp/webb-ui-components/typography';

const BridgeControlShowcase = () => {
  return (
    <div className='p-4 space-y-10 justify-items-stretch bg-mono-0 dark:bg-mono-200 rounded-xl'>
      <div className='flex'>
        <div className='grow shrink-0 basic-1'>
          <Typography variant='h3' ta='center' fw='bold' className='mb-4'>
            Withdraw Card
          </Typography>
          <WithdrawCard className='mx-auto' />
        </div>

        <div className='grow shrink-0 basic-1'>
          <Typography variant='h3' ta='center' fw='bold' className='mb-4'>
            Deposit Card
          </Typography>
          <DepositCard className='mx-auto' buttonProps={{ children: 'Connect wallet' }} />
        </div>
      </div>

      <div className='flex'>
        <div className='grow shrink-0 basic-1'>
          <Typography variant='h3' ta='center' fw='bold' className='mb-4'>
            Transfer Card
          </Typography>
          <TransferCard className='mx-auto' />
        </div>
      </div>

      <div className='flex justify-center'>
        <DepositConfirm
          note='webb://v2:vanchor/1099511627780:109951123431284u182p347130287412083741289341238412472389741382974'
          amount={1.01}
          token1Symbol='eth'
          token2Symbol='weth'
          sourceChain='dot'
          destChain='eth'
        />
      </div>
    </div>
  );
};

export default BridgeControlShowcase;
