import { type FC, useCallback, useMemo, useState } from 'react';
import { Button, Textarea } from '@tangle-network/sandbox-ui/primitives';

import { ZERO_BYTES32, type WizardState } from './types';

/**
 * Step 5: post-publish hand-off. Generates a markdown blob the operator can
 * drop into Slack / Telegram / Discord, and links back to the relevant
 * service-detail pages.
 *
 * No network calls here — the wizard never assumes the dapp can post to
 * external channels. Just clipboard + deep links.
 */
interface Step5Props {
  state: WizardState;
  blueprintId: bigint;
  blueprintName?: string;
  publishedVersionId: bigint | null;
  servicesPath?: string;
}

export const Step5Notify: FC<Step5Props> = ({
  state,
  blueprintId,
  blueprintName,
  publishedVersionId,
  servicesPath,
}) => {
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => {
    const lines = [
      `*New binary version published — ${blueprintName ?? `blueprint #${blueprintId}`}*`,
      ``,
      `Version: \`v${publishedVersionId?.toString() ?? '?'}\``,
      `Binary URI: \`${state.binaryUri}\``,
      `sha256: \`${state.binaryHash ?? '(missing)'}\``,
      state.attestationHash !== ZERO_BYTES32
        ? `Attestation digest: \`${state.attestationHash}\``
        : null,
      ``,
      `Operators on APPROVE policy: ack the version on your service detail page.`,
      `Operators on AUTO policy: nothing to do — your service will track this on the next epoch.`,
    ].filter((line): line is string => line !== null);
    return lines.join('\n');
  }, [
    blueprintName,
    blueprintId,
    publishedVersionId,
    state.binaryUri,
    state.binaryHash,
    state.attestationHash,
  ]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Surface to the user — copying can fail in non-secure contexts.
      window.alert('Copy failed. Select the text manually instead.');
    }
  }, [markdown]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-80 uppercase tracking-wider">
          Notify operators (optional)
        </p>
        <p className="text-mono-100 dark:text-mono-80 text-xs">
          Paste this into your operator channel. Markdown formatting is
          Slack-flavored but renders cleanly in most channels.
        </p>
      </div>

      <Textarea
        rows={9}
        readOnly
        value={markdown}
        className="font-mono text-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="sandbox" onClick={() => void handleCopy()}>
          {copied ? 'Copied ✓' : 'Copy Slack message'}
        </Button>
        {servicesPath && (
          <a
            href={servicesPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-40 text-sm hover:underline"
          >
            Open services list →
          </a>
        )}
      </div>
    </div>
  );
};

export default Step5Notify;
