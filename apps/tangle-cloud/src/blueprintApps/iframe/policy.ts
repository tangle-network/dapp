import type { Hex } from 'viem';
import type {
  IframeRequest,
  IframeRequestSignTransaction,
  IframeRequestSignMessage,
  IframeRequestSwitchChain,
  IframeRequestReadAccount,
} from './protocol';
import type { BlueprintIframeConfig } from './types';

// Result of semantic policy checks against the manifest's iframe config.
// On reject, `reason` is a human-readable string suitable for surfacing in
// both the dapp's approval modal (so the user sees why a request was denied)
// and the iframe's error response (so the publisher can debug).
export type IframePolicyVerdict = { ok: true } | { ok: false; reason: string };

const accept = (): IframePolicyVerdict => ({ ok: true });
const reject = (reason: string): IframePolicyVerdict => ({ ok: false, reason });

const extractSelector = (data: Hex): Hex | null => {
  // 0x + 8 hex chars; anything shorter has no selector
  if (data.length < 10) return null;
  return data.slice(0, 10).toLowerCase() as Hex;
};

export function checkSignTransactionAllowed(
  request: IframeRequestSignTransaction,
  config: BlueprintIframeConfig,
): IframePolicyVerdict {
  if (
    config.allowedChainIds.length > 0 &&
    !config.allowedChainIds.includes(request.chainId)
  ) {
    return reject(
      `Chain ${request.chainId} is not in this app's allowedChainIds list.`,
    );
  }

  if (config.contracts.length === 0) {
    return reject(
      'This app has no contract grants in its manifest; signing is disabled.',
    );
  }

  const target = request.to.toLowerCase();
  const grant = config.contracts.find(
    (g) => g.chainId === request.chainId && g.address.toLowerCase() === target,
  );

  if (!grant) {
    return reject(
      `Contract ${request.to} on chain ${request.chainId} is not in this app's contract allowlist.`,
    );
  }

  if (grant.selectors && grant.selectors.length > 0) {
    const selector = extractSelector(request.data);
    if (!selector) {
      return reject(
        'Calldata is too short to contain a function selector but the contract has a selector allowlist.',
      );
    }
    if (!grant.selectors.map((s) => s.toLowerCase()).includes(selector)) {
      return reject(
        `Selector ${selector} is not in this contract's selector allowlist.`,
      );
    }
  }

  return accept();
}

export function checkSignMessageAllowed(
  request: IframeRequestSignMessage,
  config: BlueprintIframeConfig,
): IframePolicyVerdict {
  const grant = config.messages.find((g) => g.chainId === request.chainId);
  if (!grant) {
    return reject(
      `Chain ${request.chainId} is not in this app's signMessage allowlist.`,
    );
  }
  if (grant.prefixes && grant.prefixes.length > 0) {
    const matches = grant.prefixes.some((p) => request.message.startsWith(p));
    if (!matches) {
      return reject(
        'Message does not start with any of the allowed prefixes for this app.',
      );
    }
  }
  return accept();
}

export function checkSwitchChainAllowed(
  request: IframeRequestSwitchChain,
  config: BlueprintIframeConfig,
): IframePolicyVerdict {
  if (!config.allowChainSwitch) {
    return reject('This app is not permitted to request network switches.');
  }
  if (
    config.allowedChainIds.length > 0 &&
    !config.allowedChainIds.includes(request.chainId)
  ) {
    return reject(
      `Chain ${request.chainId} is not in this app's allowedChainIds list.`,
    );
  }
  return accept();
}

export function checkReadAccountAllowed(
  _request: IframeRequestReadAccount,
  config: BlueprintIframeConfig,
): IframePolicyVerdict {
  if (!config.allowReadAccount) {
    return reject('This app is not permitted to read the connected account.');
  }
  return accept();
}

// Top-level semantic gate. Returns ok/reason for any request kind. Called
// by the bridge before surfacing an approval modal to the user. Even when
// `ok: true` is returned, the user still has to confirm in the parent UI —
// this is just a fail-fast check that the manifest declared the capability.
export function checkRequestAllowed(
  request: IframeRequest,
  config: BlueprintIframeConfig,
): IframePolicyVerdict {
  switch (request.kind) {
    case 'tangle.app.handshake':
      return accept();
    case 'tangle.app.readAccount':
      return checkReadAccountAllowed(request, config);
    case 'tangle.app.requestConnect':
      // Initiating a connect is read-tier: an app allowed to read the account
      // may prompt the user to connect one. The user still confirms in the
      // parent's own wallet modal — no silent connection.
      return checkReadAccountAllowed(
        {
          kind: 'tangle.app.readAccount',
          correlationId: request.correlationId,
        },
        config,
      );
    case 'tangle.app.switchChain':
      return checkSwitchChainAllowed(request, config);
    case 'tangle.app.signMessage':
      return checkSignMessageAllowed(request, config);
    case 'tangle.app.signTransaction':
      return checkSignTransactionAllowed(request, config);
    case 'tangle.app.signTypedData':
      // Typed-data signing follows the same gate as signMessage — if the
      // app can request a personal_sign it can request typed-data. The
      // bridge currently short-circuits this with a "not yet wired" error
      // before any modal; when wired, this gate already governs it.
      return checkSignMessageAllowed(
        // signTypedData carries chainId like the others; reuse the message
        // gate which only checks the signing capability flag + chain.
        request as unknown as IframeRequestSignMessage,
        config,
      );
    case 'tangle.app.callJob':
      // Job invocation is allowed at the policy layer for any iframe that
      // can read its account (the baseline embedded-app capability). The
      // actual submit goes through the user's wallet approval downstream,
      // so there's no "silent spend" risk from accepting here.
      return checkReadAccountAllowed(
        {
          kind: 'tangle.app.readAccount',
          correlationId: request.correlationId,
        },
        config,
      );
  }
}
