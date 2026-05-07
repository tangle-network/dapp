import { type FC, useCallback, useState } from 'react';
import {
  useChainId,
  useSendTransaction,
  useSignMessage,
  useSwitchChain,
} from 'wagmi';
import type { Hex } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@tangle-network/sandbox-ui/primitives';
import { Button } from '../../components/sandbox/SandboxUi';
import type {
  ApprovalResult,
  PendingApproval,
} from '../iframe/useIframeBridge';
import type { BlueprintIframeConfig } from '../iframe/types';

type Props = {
  pending: PendingApproval | null;
  config: BlueprintIframeConfig;
  appDisplayName: string;
  onApprove: (result: ApprovalResult) => void;
  onReject: (reason: string) => void;
};

const RequestSummary: FC<{ pending: PendingApproval }> = ({ pending }) => {
  switch (pending.kind) {
    case 'tangle.app.signTransaction': {
      const r = pending.request;
      return (
        <div className="space-y-2 text-sm">
          <Row label="Action" value="Send transaction" />
          <Row label="Chain" value={String(r.chainId)} />
          <Row label="To" value={r.to} mono />
          {r.value && r.value !== '0' && (
            <Row label="Value (wei)" value={r.value} mono />
          )}
          <Row
            label="Calldata"
            value={`${r.data.slice(0, 10)}… (${(r.data.length - 2) / 2} bytes)`}
            mono
          />
        </div>
      );
    }
    case 'tangle.app.signMessage': {
      const r = pending.request;
      return (
        <div className="space-y-2 text-sm">
          <Row label="Action" value="Sign message" />
          <Row label="Chain" value={String(r.chainId)} />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Message</p>
            <pre className="rounded-md border border-border bg-muted/40 p-3 text-xs whitespace-pre-wrap break-all max-h-48 overflow-auto">
              {r.message}
            </pre>
          </div>
        </div>
      );
    }
    case 'tangle.app.switchChain': {
      const r = pending.request;
      return (
        <div className="space-y-2 text-sm">
          <Row label="Action" value="Switch network" />
          <Row label="Target chain" value={String(r.chainId)} />
        </div>
      );
    }
  }
};

const Row: FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span
      className={mono ? 'font-mono text-xs break-all' : 'text-sm'}
      title={value}
    >
      {value}
    </span>
  </div>
);

const IframeAppApprovalModal: FC<Props> = ({
  pending,
  config,
  appDisplayName,
  onApprove,
  onReject,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  const handleApprove = useCallback(async () => {
    if (!pending) return;
    setSubmitting(true);
    try {
      switch (pending.kind) {
        case 'tangle.app.signTransaction': {
          const r = pending.request;
          if (chainId !== r.chainId) {
            onReject(
              `Active chain ${chainId} doesn't match the request's chain ${r.chainId}. Switch network first.`,
            );
            return;
          }
          const txHash = await sendTransactionAsync({
            to: r.to,
            data: r.data,
            value: r.value !== undefined ? BigInt(r.value) : undefined,
            chainId: r.chainId,
          });
          onApprove({ ok: true, data: { txHash: txHash as Hex } });
          return;
        }
        case 'tangle.app.signMessage': {
          const r = pending.request;
          const signature = await signMessageAsync({ message: r.message });
          onApprove({ ok: true, data: { signature: signature as Hex } });
          return;
        }
        case 'tangle.app.switchChain': {
          const r = pending.request;
          await switchChainAsync({ chainId: r.chainId });
          onApprove({ ok: true, data: { chainId: r.chainId } });
          return;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed.';
      onReject(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    chainId,
    onApprove,
    onReject,
    pending,
    sendTransactionAsync,
    signMessageAsync,
    switchChainAsync,
  ]);

  const handleReject = useCallback(() => {
    onReject('User rejected the request.');
  }, [onReject]);

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open: boolean) => {
        if (!open && !submitting) handleReject();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Approve {pending?.kind.replace('tangle.app.', '')}
          </DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{appDisplayName}</span> at{' '}
            <span className="font-mono text-xs">{config.origin}</span> is
            requesting your wallet to perform an action. Review the details
            carefully — this app cannot read your wallet directly; it can only
            ask you to approve specific operations declared in its manifest.
          </DialogDescription>
        </DialogHeader>

        {pending && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <RequestSummary pending={pending} />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={handleReject}
            isDisabled={submitting}
          >
            Reject
          </Button>
          <Button
            onClick={() => {
              void handleApprove();
            }}
            isLoading={submitting}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IframeAppApprovalModal;
