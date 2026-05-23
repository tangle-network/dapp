import {
  forwardRef,
  type CSSProperties,
  type ForwardedRef,
  type IframeHTMLAttributes,
} from 'react';
import type { BlueprintIframeConfig } from '../iframe/types';
import { buildBlueprintIframeUrl } from '../iframe/url';

type Props = {
  config: BlueprintIframeConfig;
  title: string;
  className?: string;
  style?: CSSProperties;
  /**
   * Mode picked in the parent UI for a multi-mode blueprint. Forwarded to
   * the iframe as `?mode=<id>` so the embedded app can dispatch on it
   * without a separate URL per mode. When omitted the iframe receives
   * `?mode=default` — see iframe/README.md for the full contract.
   */
  mode?: string;
  /**
   * On-chain blueprint id for the selected mode. Forwarded as
   * `?blueprintId=<id>` so the iframe knows which deployment it's
   * embedded under (the parent may have collapsed several into one
   * curated card).
   */
  blueprintId?: bigint | number;
  // Tests / non-DOM environments may want to render with a stub.
  iframeProps?: Pick<IframeHTMLAttributes<HTMLIFrameElement>, 'name'>;
};

// Hardened iframe sandbox. We deliberately omit:
//  - allow-same-origin: forces opaque origin so the iframe can't reach
//    parent.localStorage / parent.cookies / window.parent.ethereum.
//  - allow-top-navigation: blocks the iframe from navigating the parent
//    window away to a phishing page.
//  - allow-modals / allow-pointer-lock: not needed; reduces UX-hijack surface.
//
// We allow:
//  - allow-scripts: required for the embedded app to function at all.
//  - allow-forms: required for normal form interactions inside the iframe.
//  - allow-popups[-to-escape-sandbox]: gated on the manifest's allowPopups
//    flag because they widen attack surface (oauth flows commonly need them).
const buildSandbox = (config: BlueprintIframeConfig): string => {
  const tokens = ['allow-scripts', 'allow-forms'];
  if (config.allowPopups) {
    tokens.push('allow-popups', 'allow-popups-to-escape-sandbox');
  }
  return tokens.join(' ');
};

// `allow=""` — an empty Permissions-Policy attribute on the iframe blocks
// every powerful API regardless of what the parent's response header says.
// Belt-and-braces: the parent ALSO sets a deny-everything Permissions-Policy
// header. If either layer is misconfigured the other still blocks.
const PERMISSIONS_POLICY_DENY_ALL = '';

const BlueprintAppFrameInner = (
  { config, title, className, style, mode, blueprintId, iframeProps }: Props,
  ref: ForwardedRef<HTMLIFrameElement>,
) => (
  <iframe
    ref={ref}
    title={title}
    src={buildBlueprintIframeUrl(config.url, { mode, blueprintId })}
    sandbox={buildSandbox(config)}
    allow={PERMISSIONS_POLICY_DENY_ALL}
    referrerPolicy="no-referrer"
    loading="lazy"
    className={className}
    style={{
      // Default to a sensible aspect; consumer can override.
      width: '100%',
      minHeight: '720px',
      border: '0',
      borderRadius: '16px',
      ...style,
    }}
    {...iframeProps}
  />
);

const BlueprintAppFrame = forwardRef(BlueprintAppFrameInner);
BlueprintAppFrame.displayName = 'BlueprintAppFrame';

export default BlueprintAppFrame;
