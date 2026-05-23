import { type FC, useEffect, useRef } from 'react';
import BlueprintAppFrame from './BlueprintAppFrame';
import IframeAppApprovalModal from './IframeAppApprovalModal';
import { useIframeBridge } from '../iframe/useIframeBridge';
import type { BlueprintIframeConfig } from '../iframe/types';

type Props = {
  config: BlueprintIframeConfig;
  appDisplayName: string;
  /**
   * Mode-picker selection for multi-mode blueprints. Forwarded to the
   * iframe as `?mode=<id>&blueprintId=<id>`. When the mode changes
   * after mount, the host posts `{type: 'tangle:mode', mode, blueprintId}`
   * to the iframe so the embedded app can dispatch without a full reload.
   */
  mode?: string;
  blueprintId?: bigint | number;
};

// Composes the hardened iframe element, the parent-side message bridge, and
// the approval modal into a single drop-in block. Use this from any page
// that wants to render a trusted iframe-mode blueprint app.
const BlueprintAppFrameHost: FC<Props> = ({
  config,
  appDisplayName,
  mode,
  blueprintId,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { pendingApproval, approve, reject } = useIframeBridge({
    config,
    iframeRef,
  });

  // Live mode-change notification. The iframe receives the picked mode in
  // the initial URL; this effect lets the parent flip modes after mount
  // without remounting the iframe (which would tear down the bridge,
  // re-handshake, and lose any in-iframe state).
  //
  // `targetOrigin` is pinned to the manifest's exact origin — never `*` —
  // so a confused-deputy frame can't intercept the mode signal.
  useEffect(() => {
    if (!mode) {
      return;
    }
    const frame = iframeRef.current;
    if (!frame?.contentWindow) {
      return;
    }
    frame.contentWindow.postMessage(
      {
        type: 'tangle:mode',
        mode,
        blueprintId: blueprintId?.toString(),
      },
      config.origin,
    );
  }, [mode, blueprintId, config.origin]);

  return (
    <>
      <BlueprintAppFrame
        ref={iframeRef}
        config={config}
        title={`${appDisplayName} (sandboxed)`}
        mode={mode}
        blueprintId={blueprintId}
      />
      <IframeAppApprovalModal
        pending={pendingApproval}
        config={config}
        appDisplayName={appDisplayName}
        onApprove={approve}
        onReject={reject}
      />
    </>
  );
};

export default BlueprintAppFrameHost;
