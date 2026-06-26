import { type FC, useCallback, useState } from 'react';
import {
  useChainId,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
} from 'wagmi';
import { bytesToHex, encodeFunctionData, type Hex } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@tangle-network/sandbox-ui/primitives';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
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
            <p className="text-xs text-mono-120 dark:text-mono-100 mb-1">
              Message
            </p>
            <pre className="rounded-md border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-3 text-xs whitespace-pre-wrap break-all max-h-48 overflow-auto">
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
    case 'tangle.app.signTypedData': {
      const r = pending.request;
      return (
        <div className="space-y-2 text-sm">
          <Row label="Action" value="Sign typed data" />
          <Row label="Chain" value={String(r.chainId)} />
          <Row label="Primary type" value={r.primaryType} mono />
          {r.domain.name && <Row label="Domain name" value={r.domain.name} />}
          {r.domain.verifyingContract && (
            <Row
              label="Verifying contract"
              value={r.domain.verifyingContract}
              mono
            />
          )}
          <div>
            <p className="text-xs text-mono-120 dark:text-mono-100 mb-1">
              Message
            </p>
            <pre className="rounded-md border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-3 text-xs whitespace-pre-wrap break-all max-h-48 overflow-auto">
              {JSON.stringify(r.message, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
    case 'tangle.app.callJob': {
      const r = pending.request;
      return (
        <div className="space-y-2 text-sm">
          <Row label="Action" value="Submit job" />
          <Row
            label="Service ID"
            value={
              pending.serviceId !== null
                ? pending.serviceId.toString()
                : 'None (no active service)'
            }
            mono
          />
          <Row label="Job index" value={String(r.jobIndex)} mono />
          <div>
            <p className="text-xs text-mono-120 dark:text-mono-100 mb-1">
              Inputs
            </p>
            <pre className="rounded-md border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-3 text-xs whitespace-pre-wrap break-all max-h-48 overflow-auto">
              {JSON.stringify(r.inputs, null, 2)}
            </pre>
          </div>
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
    <span className="text-xs text-mono-120 dark:text-mono-100">{label}</span>
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
  const { signTypedDataAsync } = useSignTypedData();
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
        case 'tangle.app.signTypedData': {
          const r = pending.request;
          if (chainId !== r.chainId) {
            onReject(
              `Active chain ${chainId} doesn't match the request's chain ${r.chainId}. Switch network first.`,
            );
            return;
          }
          const signature = await signTypedDataAsync({
            domain: r.domain,
            types: r.types,
            primaryType: r.primaryType,
            message: r.message,
          });
          onApprove({ ok: true, data: { signature: signature as Hex } });
          return;
        }
        case 'tangle.app.callJob': {
          const r = pending.request;
          if (pending.serviceId === null) {
            onReject(
              'No active service for this blueprint — cannot submit job.',
            );
            return;
          }
          let contracts: ReturnType<typeof getContractsByChainId>;
          try {
            contracts = getContractsByChainId(chainId);
          } catch {
            onReject(`No Tangle contract deployed on chain ${chainId}.`);
            return;
          }
          // Encode inputs as UTF-8 JSON bytes — the same fallback path
          // used by JobSubmissionForm when no ABI schema is available.
          const jsonBytes = new TextEncoder().encode(JSON.stringify(r.inputs));
          const encodedInputs = bytesToHex(jsonBytes);
          const data = encodeFunctionData({
            abi: TANGLE_ABI,
            functionName: 'submitJob',
            args: [pending.serviceId, r.jobIndex, encodedInputs],
          });
          const txHash = await sendTransactionAsync({
            to: contracts.tangle,
            data,
          });
          onApprove({ ok: true, data: { txHash: txHash as Hex } });
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
    signTypedDataAsync,
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
          <div className="rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-4">
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
