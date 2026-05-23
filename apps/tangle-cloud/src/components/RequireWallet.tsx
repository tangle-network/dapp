import { type FC, type PropsWithChildren } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';

type Props = PropsWithChildren<{
  title?: string;
  description?: string;
  eyebrow?: string;
  checks?: string[];
}>;

const RequireWallet: FC<Props> = ({
  children,
  title = 'Connect wallet',
  description = 'Connect your wallet to access this feature.',
  eyebrow = 'Wallet',
  checks = [
    'Read account state',
    'Prepare transactions',
    'Submit on-chain actions',
  ],
}) => {
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <Card variant="sandbox" className="w-full overflow-hidden">
      <CardContent className="relative p-6 md:p-7">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_18%_12%,rgba(99,102,241,0.20),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(16,185,129,0.10),transparent_30%)]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <div className="mt-2 font-display font-extrabold text-foreground text-xl leading-tight tracking-tight md:text-2xl">
              {title}
            </div>
            <p className="mt-2 text-muted-foreground text-sm leading-6">
              {description}
            </p>
            {checks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {checks.map((check) => (
                  <span
                    key={check}
                    className="rounded-full border border-border bg-background/40 px-3 py-1 text-foreground text-xs"
                  >
                    {check}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ConnectWalletButton className="tangle-cloud-wallet-action shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RequireWallet;
