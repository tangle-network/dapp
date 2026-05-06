import { type FC, useRef } from 'react';
import BlueprintAppFrame from './BlueprintAppFrame';
import IframeAppApprovalModal from './IframeAppApprovalModal';
import { useIframeBridge } from '../iframe/useIframeBridge';
import type { BlueprintIframeConfig } from '../iframe/types';

type Props = {
  config: BlueprintIframeConfig;
  appDisplayName: string;
};

// Composes the hardened iframe element, the parent-side message bridge, and
// the approval modal into a single drop-in block. Use this from any page
// that wants to render a trusted iframe-mode blueprint app.
const BlueprintAppFrameHost: FC<Props> = ({ config, appDisplayName }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { pendingApproval, approve, reject } = useIframeBridge({
    config,
    iframeRef,
  });

  return (
    <>
      <BlueprintAppFrame
        ref={iframeRef}
        config={config}
        title={`${appDisplayName} (sandboxed)`}
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
