import { type FC, type PropsWithChildren } from 'react';
import { useAccount } from 'wagmi';
import { Typography, Card, CardVariant } from '@tangle-network/ui-components';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';

type Props = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

const RequireWallet: FC<Props> = ({
  children,
  title = 'Wallet Required',
  description = 'Connect your wallet to access this feature.',
}) => {
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <Card variant={CardVariant.DEFAULT} className="text-center py-12">
      <Typography variant="h4" fw="semibold">
        {title}
      </Typography>

      <Typography variant="body1" className="mt-2 text-mono-100">
        {description}
      </Typography>

      <div className="mt-6 flex justify-center">
        <ConnectWalletButton />
      </div>
    </Card>
  );
};

export default RequireWallet;
