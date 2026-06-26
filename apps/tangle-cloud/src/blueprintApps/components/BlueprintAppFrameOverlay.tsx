import { type FC, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@tangle-network/sandbox-ui/primitives';
import { focus, typeRole } from '../../styles/chrome';
import StatusPill from '../../components/chrome/StatusPill';

/**
 * Designed load states for the embedded publisher app. The iframe is a dead
 * rectangle until the origin responds; without these overlays a slow or
 * unreachable origin shows a silent blank surface (audit EMBED-2). Each phase
 * gets a real label, a tone pill, and — for the failure phases — a retry.
 *
 * Phases:
 *   loading  — handshake hasn't completed; show a shape-matched skeleton so the
 *              user sees the surface is alive, not frozen.
 *   timeout  — `onLoad` never fired inside the budget; the origin is slow or the
 *              network is degraded. Retry reloads the frame.
 *   error    — the iframe element raised `error`, or the origin refused to frame
 *              (X-Frame-Options / CSP). Retry + open-in-new-tab escape hatch.
 *   blocked  — the parent couldn't build a valid iframe URL/origin (malformed
 *              manifest). Not retryable here; the publisher must fix the manifest.
 */
export type FramePhase = 'loading' | 'ready' | 'timeout' | 'error' | 'blocked';

type Props = {
  phase: FramePhase;
  appDisplayName: string;
  /** Origin the app loads from — shown so the user can audit where it came from. */
  origin: string;
  /** Reload the iframe (bumps the key in the host). */
  onRetry?: () => void;
  /** Standalone URL for the open-in-new-tab escape hatch on failure phases. */
  externalUrl?: string;
  /** Rounded corners match the frame's 12px radius; focus-mode passes 0. */
  rounded?: boolean;
};

const PHASE_COPY: Record<
  Exclude<FramePhase, 'ready'>,
  { tone: 'pending' | 'warning' | 'danger' | 'neutral'; label: string }
> = {
  loading: { tone: 'pending', label: 'Connecting' },
  timeout: { tone: 'warning', label: 'Slow to respond' },
  error: { tone: 'danger', label: 'Unavailable' },
  blocked: { tone: 'danger', label: 'Blocked' },
};

const PHASE_TITLE: Record<Exclude<FramePhase, 'ready'>, string> = {
  loading: 'Loading the app',
  timeout: 'The app is taking too long',
  error: 'The app could not be loaded',
  blocked: 'This app cannot be embedded',
};

const phaseBody = (
  phase: Exclude<FramePhase, 'ready'>,
  appDisplayName: string,
): ReactNode => {
  switch (phase) {
    case 'loading':
      return `Waiting for ${appDisplayName} to respond.`;
    case 'timeout':
      return `${appDisplayName} did not finish loading. The origin may be slow or temporarily down — retry, or open it in a new tab.`;
    case 'error':
      return `${appDisplayName} refused to load in this frame. The origin may be offline or may not allow embedding.`;
    case 'blocked':
      return `The blueprint manifest does not point at a valid app origin, so it can't be embedded safely. The publisher must fix the manifest.`;
  }
};

/**
 * Skeleton that mirrors a typical embedded app's chrome (top bar + content
 * blocks) so the loading state reads as the app's shape, not a spinner over a
 * void. Pure decoration — aria-hidden — the live region lives in the overlay.
 */
const FrameSkeleton: FC = () => (
  <div aria-hidden className="absolute inset-0 flex flex-col gap-3 p-4">
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 animate-pulse rounded-md bg-[color:var(--bg-elevated)]" />
      <div className="h-4 w-40 animate-pulse rounded bg-[color:var(--bg-elevated)]" />
      <div className="ml-auto h-7 w-24 animate-pulse rounded-md bg-[color:var(--bg-elevated)]" />
    </div>
    <div className="grid flex-1 gap-3 md:grid-cols-3">
      <div className="hidden animate-pulse rounded-lg bg-[color:var(--bg-elevated)] md:block" />
      <div className="col-span-2 flex flex-col gap-3">
        <div className="h-24 animate-pulse rounded-lg bg-[color:var(--bg-elevated)]" />
        <div className="flex-1 animate-pulse rounded-lg bg-[color:var(--bg-elevated)]" />
      </div>
    </div>
  </div>
);

/**
 * Overlay rendered above the iframe for every non-ready phase. On `loading` it
 * is a translucent veil over the skeleton (so a fast app flashes minimally); on
 * failure phases it is an opaque panel with the recovery actions.
 */
const BlueprintAppFrameOverlay: FC<Props> = ({
  phase,
  appDisplayName,
  origin,
  onRetry,
  externalUrl,
  rounded = true,
}) => {
  if (phase === 'ready') return null;
  const meta = PHASE_COPY[phase];
  const isFailure = phase !== 'loading';

  return (
    <div
      role={phase === 'error' || phase === 'blocked' ? 'alert' : 'status'}
      aria-live="polite"
      className={twMerge(
        'absolute inset-0 z-10 flex items-center justify-center bg-mono-0 dark:bg-mono-190',
        rounded && 'rounded-[12px]',
        phase === 'loading' &&
          'bg-mono-0 dark:bg-mono-190/85 backdrop-blur-[1px]',
      )}
    >
      {phase === 'loading' && <FrameSkeleton />}
      <div
        className={twMerge(
          'relative flex max-w-md flex-col items-center gap-3 px-6 text-center',
          isFailure &&
            'rounded-lg border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-mono-0 dark:bg-mono-180)] py-6 shadow-sm',
        )}
      >
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
        <div className="space-y-1.5">
          <h2
            className={twMerge(
              typeRole.section,
              'text-mono-200 dark:text-mono-0',
            )}
          >
            {PHASE_TITLE[phase]}
          </h2>
          <p className="text-sm leading-relaxed text-mono-100 dark:text-mono-80">
            {phaseBody(phase, appDisplayName)}
          </p>
          <p className="pt-1 font-mono text-xs text-mono-100 dark:text-mono-80/70">
            {origin}
          </p>
        </div>
        {isFailure && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {onRetry && phase !== 'blocked' && (
              <Button size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className={twMerge(
                  'inline-flex h-8 items-center rounded-md border border-mono-60 dark:border-mono-170 bg-transparent px-3 text-xs font-medium text-mono-200 dark:text-mono-0 transition-colors hover:bg-[color:var(--bg-hover)]',
                  focus.ring,
                )}
              >
                Open in new tab ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueprintAppFrameOverlay;
