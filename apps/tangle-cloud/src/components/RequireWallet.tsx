import { type FC, type PropsWithChildren } from 'react';
import { useAccount } from 'wagmi';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { EmptyState } from './chrome';
import { typeRole } from '../styles/chrome';

type Props = PropsWithChildren<{
  title?: string;
  description?: string;
  eyebrow?: string;
  checks?: string[];
}>;

/**
 * Renders children when a wallet is connected; otherwise shows a focused
 * "connect your wallet" panel using the chrome system's `EmptyState`. The
 * panel matches the rest of the cloud-app — no gradient hero, no tinted
 * "sandbox" card variant, no decorative radial backdrop — so pages that gate
 * behind a wallet (Rewards, Earnings) look like the same product as the
 * pages that don't.
 *
 * Checks are rendered as outlined chips below the description; the connect
 * button is the EmptyState's primary action.
 */
const RequireWallet: FC<Props> = ({
  children,
  title = 'Connect your wallet',
  description = 'Connect to read account state, prepare transactions, and submit on-chain actions.',
  eyebrow,
  checks = [],
}) => {
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <EmptyState
      kind="no-permission"
      title={title}
      description={
        <span className="space-y-3">
          {eyebrow !== undefined && (
            <span className={`${typeRole.label} block text-center`}>
              {eyebrow}
            </span>
          )}
          <span className="block">{description}</span>
          {checks.length > 0 && (
            <span className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {checks.map((check) => (
                <span
                  key={check}
                  className="rounded-full border border-border bg-transparent px-2.5 py-0.5 text-xs text-foreground"
                >
                  {check}
                </span>
              ))}
            </span>
          )}
        </span>
      }
      primary={<ConnectWalletButton className="tangle-cloud-wallet-action" />}
    />
  );
};

export default RequireWallet;
