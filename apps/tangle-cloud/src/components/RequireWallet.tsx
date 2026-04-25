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
  checks = ['Read account state', 'Prepare transactions', 'Submit on-chain actions'],
}) => {
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <Card
      variant="sandbox"
      className="mx-auto max-w-3xl overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
    >
      <CardContent className="relative p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_18%_12%,rgba(99,102,241,0.20),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(16,185,129,0.10),transparent_30%)]" />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-display font-extrabold text-foreground text-2xl leading-tight tracking-tight md:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground text-sm leading-6">
              {description}
            </p>
            {checks.length > 0 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {checks.map((check) => (
                  <div
                    key={check}
                    className="rounded-lg border border-border bg-background/40 px-3 py-2 text-muted-foreground text-xs"
                  >
                    {check}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:justify-self-end">
            <ConnectWalletButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequireWallet;
