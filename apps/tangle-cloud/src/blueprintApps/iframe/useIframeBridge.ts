import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useChainId, useChains } from 'wagmi';
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
import { useWalletConnectModal } from './WalletConnectModalContext';

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

// Service context the parent broadcasts to the iframe so the embedded app
// knows which blueprint/service it renders for + which operators are
// available + the active chain. All read-only; the iframe uses it to drive
// direct operator HTTP calls + a read-only viem client (no signing here).
export type IframeServiceContext = {
  blueprintId: string;
  serviceId: string | null;
  operators: Array<{
    address: Address;
    rpcAddress: string | undefined;
    status: 'active' | 'inactive' | 'unknown';
  }>;
  jobs: Array<{ index: number; name: string }>;
  mode: string | null;
  chain?: {
    id: number;
    name: string;
    rpcUrl: string;
    blockExplorerUrl?: string;
    nativeCurrency?: { name: string; symbol: string; decimals: number };
  };
};

type Options = {
  config: BlueprintIframeConfig;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  // Caller decides if the bridge is allowed to surface modals. When the page
  // is hidden / the iframe wasn't mounted, set this to false to no-op.
  enabled?: boolean;
  // Service context broadcast to the iframe on mount + whenever it changes.
  // Optional — when absent the iframe just doesn't receive a serviceContext
  // event (older iframes / non-service surfaces).
  serviceContext?: IframeServiceContext;
  onPolicyDeny?: (
    request: IframeRequest,
    verdict: IframePolicyVerdict & { ok: false },
  ) => void;
};

export function useIframeBridge({
  config,
  iframeRef,
  enabled = true,
  serviceContext,
  onPolicyDeny,
}: Options) {
  const { address } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const { open: openWalletModal, isOpen: walletModalOpen } =
    useWalletConnectModal();
  const [pendingApproval, setPendingApproval] =
    useState<PendingApproval | null>(null);
  const pendingRef = useRef(pendingApproval);
  useEffect(() => {
    pendingRef.current = pendingApproval;
  }, [pendingApproval]);
  // correlationId of an in-flight tangle.app.requestConnect (the iframe asked
  // us to connect a wallet). Resolved when an account appears, or rejected if
  // the user dismisses the modal without connecting.
  const pendingConnectRef = useRef<string | null>(null);

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

  // Broadcast service context (blueprint/service/operators/chain) so the
  // thin-iframe SDK's `useTangleService` + `useTanglePublicClient` resolve.
  // Re-fires whenever the context object changes (mode swap, new service,
  // operator delta). Serialized into the dep so the effect only re-runs on
  // real changes, not new object identity each render.
  // Derive chain context from the active wagmi chain so the iframe's
  // `useTanglePublicClient` can build a read-only client. Falls back to the
  // serviceContext's own chain if the caller supplied one explicitly.
  const activeChain = chains.find((c) => c.id === chainId);
  const chainContext =
    serviceContext?.chain ??
    (activeChain
      ? {
          id: activeChain.id,
          name: activeChain.name,
          rpcUrl: activeChain.rpcUrls.default.http[0] ?? '',
          blockExplorerUrl: activeChain.blockExplorers?.default.url,
          nativeCurrency: {
            name: activeChain.nativeCurrency.name,
            symbol: activeChain.nativeCurrency.symbol,
            decimals: activeChain.nativeCurrency.decimals,
          },
        }
      : undefined);

  // Latest wallet/chain/service snapshot, read by the handshake handler so a
  // freshly-loaded iframe can be synced on connect without re-subscribing the
  // message listener on every wallet/service change.
  const syncRef = useRef<{
    address?: string;
    chainId?: number;
    serviceContext?: IframeServiceContext;
    chainContext?: typeof chainContext;
  }>({});
  useEffect(() => {
    syncRef.current = { address, chainId, serviceContext, chainContext };
  }, [address, chainContext, chainId, serviceContext]);

  const serviceContextKey = serviceContext
    ? JSON.stringify({ ...serviceContext, chain: chainContext })
    : null;
  useEffect(() => {
    if (!enabled || !serviceContext) return;
    post({
      kind: 'tangle.app.serviceContext',
      blueprintId: serviceContext.blueprintId,
      serviceId: serviceContext.serviceId,
      operators: serviceContext.operators,
      jobs: serviceContext.jobs,
      mode: serviceContext.mode,
      ...(chainContext ? { chain: chainContext } : {}),
    });
    // serviceContextKey captures the meaningful change; serviceContext +
    // chainContext are read inside but intentionally not in deps (would
    // re-fire on identity each render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceContextKey, enabled, post]);

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
        // Sync current state to the freshly-handshaking iframe. The
        // accountChanged / chainChanged / serviceContext broadcast effects
        // fire on mount — typically before the iframe has loaded and attached
        // its listener — so without replaying them here on handshake, a late
        // iframe would ack but never receive the wallet (stuck "no-wallet").
        const sync = syncRef.current;
        post({
          kind: 'tangle.app.accountChanged',
          account: (sync.address ?? null) as Address | null,
        });
        if (typeof sync.chainId === 'number') {
          post({ kind: 'tangle.app.chainChanged', chainId: sync.chainId });
        }
        if (sync.serviceContext) {
          post({
            kind: 'tangle.app.serviceContext',
            blueprintId: sync.serviceContext.blueprintId,
            serviceId: sync.serviceContext.serviceId,
            operators: sync.serviceContext.operators,
            jobs: sync.serviceContext.jobs,
            mode: sync.serviceContext.mode,
            ...(sync.chainContext ? { chain: sync.chainContext } : {}),
          });
        }
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

      // The iframe asked us to connect a wallet. If one is already connected,
      // answer immediately; otherwise open the parent's connect modal and
      // resolve later (see the address / modal-close effects below).
      if (request.kind === 'tangle.app.requestConnect') {
        if (address) {
          post({
            kind: 'tangle.app.connectResult',
            correlationId: request.correlationId,
            ok: true,
            data: { account: address as Address, chainId: chainId ?? 0 },
          });
          return;
        }
        pendingConnectRef.current = request.correlationId;
        openWalletModal();
        return;
      }

      // callJob (job invocation via quote/sign/submit) is protocol-defined
      // but its parent-side integration with the deploy/quote pipeline is
      // not yet wired. Respond with a clean error so the iframe surfaces a
      // real message instead of hanging on the request timeout. Tracked as
      // a dedicated follow-up — the financial submit path needs its own
      // careful review, not a tail-of-session bolt-on.
      if (request.kind === 'tangle.app.callJob') {
        post({
          kind: 'tangle.app.jobResult',
          correlationId: request.correlationId,
          status: 'error',
          error:
            'callJob is not yet wired in this parent build. Use direct operator HTTP for reads; on-chain job submission is coming.',
        });
        return;
      }

      // signTypedData routes through the approval modal (same as
      // signMessage / signTransaction) but the modal + signer integration
      // for typed-data isn't wired yet. Clean error rather than a hang.
      if (request.kind === 'tangle.app.signTypedData') {
        post({
          kind: 'tangle.app.signTypedDataResult',
          correlationId: request.correlationId,
          ok: false,
          error:
            'signTypedData approval is not yet wired in this parent build.',
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
    openWalletModal,
    post,
    respond,
  ]);

  // Resolve an in-flight requestConnect once a wallet connects.
  useEffect(() => {
    if (!enabled || !address || !pendingConnectRef.current) return;
    post({
      kind: 'tangle.app.connectResult',
      correlationId: pendingConnectRef.current,
      ok: true,
      data: { account: address as Address, chainId: chainId ?? 0 },
    });
    pendingConnectRef.current = null;
  }, [address, chainId, enabled, post]);

  // If the user dismissed the connect modal without connecting, reject the
  // in-flight requestConnect so the iframe gets a clean error rather than
  // hanging until its timeout.
  useEffect(() => {
    if (walletModalOpen || !pendingConnectRef.current || address) return;
    post({
      kind: 'tangle.app.connectResult',
      correlationId: pendingConnectRef.current,
      ok: false,
      error: 'User dismissed the connect modal.',
    });
    pendingConnectRef.current = null;
  }, [walletModalOpen, address, post]);

  return {
    pendingApproval,
    approve,
    reject,
  };
}
