import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import type { Address, Hex } from 'viem';
import {
  validateIframeRequest,
  type IframeRequest,
  type ParentMessage,
  IFRAME_PROTOCOL_VERSION,
} from './protocol';
import { isMessageFromIframe, buildIframeMessageContext } from './origin';
import { checkRequestAllowed, type IframePolicyVerdict } from './policy';
import type { BlueprintIframeConfig } from './types';

// Pending operator-approved request that the bridge is waiting on the user
// to confirm via the dapp's approval modal. Surfaced through the hook's
// return so the consumer can render the modal.
export type PendingApproval =
  | {
      kind: 'tangle.app.signTransaction';
      request: Extract<IframeRequest, { kind: 'tangle.app.signTransaction' }>;
    }
  | {
      kind: 'tangle.app.signMessage';
      request: Extract<IframeRequest, { kind: 'tangle.app.signMessage' }>;
    }
  | {
      kind: 'tangle.app.switchChain';
      request: Extract<IframeRequest, { kind: 'tangle.app.switchChain' }>;
    };

// Outcome the consumer reports back via approve/reject. The bridge turns
// this into a postMessage response the iframe receives keyed on correlationId.
export type ApprovalResult =
  | { ok: true; data: { txHash: Hex } }
  | { ok: true; data: { signature: Hex } }
  | { ok: true; data: { chainId: number } }
  | { ok: false; reason: string };

type Options = {
  config: BlueprintIframeConfig;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  // Caller decides if the bridge is allowed to surface modals. When the page
  // is hidden / the iframe wasn't mounted, set this to false to no-op.
  enabled?: boolean;
  onPolicyDeny?: (
    request: IframeRequest,
    verdict: IframePolicyVerdict & { ok: false },
  ) => void;
};

export function useIframeBridge({
  config,
  iframeRef,
  enabled = true,
  onPolicyDeny,
}: Options) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [pendingApproval, setPendingApproval] =
    useState<PendingApproval | null>(null);
  const pendingRef = useRef(pendingApproval);
  pendingRef.current = pendingApproval;

  const post = useCallback(
    (message: ParentMessage) => {
      const target = iframeRef.current?.contentWindow;
      if (!target) return;
      // Always pin targetOrigin to the manifest-declared origin. Never use '*'.
      target.postMessage(message, config.origin);
    },
    [config.origin, iframeRef],
  );

  const respond = useCallback(
    (
      correlationId: string,
      result: ApprovalResult,
      kind: PendingApproval['kind'],
    ) => {
      switch (kind) {
        case 'tangle.app.signTransaction': {
          const data =
            result.ok && 'txHash' in result.data ? result.data : null;
          post(
            data
              ? {
                  kind: 'tangle.app.signTransactionResult',
                  correlationId,
                  ok: true,
                  data,
                }
              : {
                  kind: 'tangle.app.signTransactionResult',
                  correlationId,
                  ok: false,
                  error: result.ok ? 'wrong-result-shape' : result.reason,
                },
          );
          return;
        }
        case 'tangle.app.signMessage': {
          const data =
            result.ok && 'signature' in result.data ? result.data : null;
          post(
            data
              ? {
                  kind: 'tangle.app.signMessageResult',
                  correlationId,
                  ok: true,
                  data,
                }
              : {
                  kind: 'tangle.app.signMessageResult',
                  correlationId,
                  ok: false,
                  error: result.ok ? 'wrong-result-shape' : result.reason,
                },
          );
          return;
        }
        case 'tangle.app.switchChain': {
          const data =
            result.ok && 'chainId' in result.data ? result.data : null;
          post(
            data
              ? {
                  kind: 'tangle.app.switchChainResult',
                  correlationId,
                  ok: true,
                  data,
                }
              : {
                  kind: 'tangle.app.switchChainResult',
                  correlationId,
                  ok: false,
                  error: result.ok ? 'wrong-result-shape' : result.reason,
                },
          );
          return;
        }
      }
    },
    [post],
  );

  const approve = useCallback(
    (result: ApprovalResult) => {
      const pending = pendingRef.current;
      if (!pending) return;
      respond(pending.request.correlationId, result, pending.kind);
      setPendingApproval(null);
    },
    [respond],
  );

  const reject = useCallback(
    (reason: string) => {
      const pending = pendingRef.current;
      if (!pending) return;
      respond(
        pending.request.correlationId,
        { ok: false, reason },
        pending.kind,
      );
      setPendingApproval(null);
    },
    [respond],
  );

  // Re-broadcast wallet state changes to the iframe. The iframe never
  // touches the wallet directly — these events let it stay in sync without
  // having to poll readAccount.
  useEffect(() => {
    if (!enabled) return;
    post({
      kind: 'tangle.app.accountChanged',
      account: (address ?? null) as Address | null,
    });
  }, [address, enabled, post]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof chainId === 'number') {
      post({ kind: 'tangle.app.chainChanged', chainId });
    }
  }, [chainId, enabled, post]);

  useEffect(() => {
    if (!enabled) return;

    const context = buildIframeMessageContext(config, iframeRef.current);

    const handler = (event: MessageEvent) => {
      // Hard origin/source gate before any parsing. event.data may be huge,
      // structuredClone'd, untyped — never touch it before this passes.
      if (!isMessageFromIframe(event, context)) return;

      const request = validateIframeRequest(event.data);
      if (!request) return;

      // Handshake is the one request that doesn't need policy review.
      if (request.kind === 'tangle.app.handshake') {
        post({
          kind: 'tangle.app.handshakeAck',
          appId: config.appId,
          protocolVersion: IFRAME_PROTOCOL_VERSION,
        });
        return;
      }

      // Semantic policy gate. If the manifest didn't declare this capability
      // we reject without ever surfacing a modal so users don't get
      // approval-fatigue prompts for things the publisher isn't allowed to
      // do anyway.
      const verdict = checkRequestAllowed(request, config);
      if (!verdict.ok) {
        onPolicyDeny?.(request, verdict);
        if (request.kind === 'tangle.app.readAccount') {
          post({
            kind: 'tangle.app.readAccountResult',
            correlationId: request.correlationId,
            ok: false,
            error: verdict.reason,
          });
        } else if (request.kind === 'tangle.app.signMessage') {
          post({
            kind: 'tangle.app.signMessageResult',
            correlationId: request.correlationId,
            ok: false,
            error: verdict.reason,
          });
        } else if (request.kind === 'tangle.app.signTransaction') {
          post({
            kind: 'tangle.app.signTransactionResult',
            correlationId: request.correlationId,
            ok: false,
            error: verdict.reason,
          });
        } else if (request.kind === 'tangle.app.switchChain') {
          post({
            kind: 'tangle.app.switchChainResult',
            correlationId: request.correlationId,
            ok: false,
            error: verdict.reason,
          });
        }
        return;
      }

      // readAccount is a manifest-gated capability that doesn't need user
      // approval each time once the user has loaded the iframe — they
      // already gave broad consent by visiting the app.
      if (request.kind === 'tangle.app.readAccount') {
        post({
          kind: 'tangle.app.readAccountResult',
          correlationId: request.correlationId,
          ok: true,
          data: {
            account: (address ??
              '0x0000000000000000000000000000000000000000') as Address,
            chainId: chainId ?? 0,
          },
        });
        return;
      }

      // Everything else needs the approval modal. If a previous approval is
      // still pending we reject the new request — the iframe is expected to
      // wait for the previous correlationId before issuing another.
      if (pendingRef.current) {
        const correlationId = (request as { correlationId?: string })
          .correlationId;
        if (typeof correlationId === 'string') {
          respond(
            correlationId,
            { ok: false, reason: 'Another approval is already pending.' },
            request.kind as PendingApproval['kind'],
          );
        }
        return;
      }

      setPendingApproval({ kind: request.kind, request } as PendingApproval);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [
    address,
    chainId,
    config,
    enabled,
    iframeRef,
    onPolicyDeny,
    post,
    respond,
  ]);

  return {
    pendingApproval,
    approve,
    reject,
  };
}
