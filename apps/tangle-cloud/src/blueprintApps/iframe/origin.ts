// Origin/source validation for iframe ↔ parent postMessage exchanges.
//
// The single most important security property of the iframe protocol is that
// the parent only acts on messages from the exact iframe it rendered — not
// from an attacker page that opened a popup with a whitelisted origin.
//
// `event.origin` proves the *origin* of the sender; `event.source` proves the
// *window object* of the sender. Both must match: origin guards against
// spoofed `kind` values, source guards against confused-deputy attacks where
// an unrelated trusted-origin tab posts at us.

import type { BlueprintIframeConfig } from './types';

export type IframeMessageContext = {
  expectedOrigin: string;
  expectedSource: WindowProxy | null;
};

export const buildIframeMessageContext = (
  config: BlueprintIframeConfig,
  iframeEl: HTMLIFrameElement | null,
): IframeMessageContext => ({
  expectedOrigin: config.origin,
  expectedSource: iframeEl?.contentWindow ?? null,
});

export const isMessageFromIframe = (
  event: MessageEvent,
  context: IframeMessageContext,
): boolean => {
  // Strict origin equality. Never use endsWith / startsWith / regex here —
  // origin spoofing via lookalike domains is a known footgun.
  if (event.origin !== context.expectedOrigin) return false;
  if (context.expectedSource === null) return false;
  // Same-window check. event.source is a WindowProxy; reference equality
  // against the iframe's contentWindow is the canonical pattern.
  if (event.source !== context.expectedSource) return false;
  return true;
};
