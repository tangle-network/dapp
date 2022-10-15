import { DepositCard } from '@webb-dapp/webb-ui-components/containers';

const BridgeControlShowcase = () => {
  return (
    <div className='p-4 bg-mono-0 dark:bg-mono-200 rounded-xl'>
      <DepositCard buttonProps={{ children: 'Connect wallet' }} />
    </div>
  );
};

export default BridgeControlShowcase;
