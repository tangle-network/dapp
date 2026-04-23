import { useEffect } from 'react';

const SANDBOX_UI_STYLES_ID = 'tangle-sandbox-ui-styles';
const SANDBOX_UI_STYLES_HREF = '/vendor/sandbox-ui.css';

export default function SandboxUiStyles() {
  useEffect(() => {
    if (document.getElementById(SANDBOX_UI_STYLES_ID)) {
      return;
    }

    const link = document.createElement('link');
    link.id = SANDBOX_UI_STYLES_ID;
    link.rel = 'stylesheet';
    link.href = SANDBOX_UI_STYLES_HREF;
    document.head.appendChild(link);

    return () => {
      if (document.querySelector(`[data-sandbox-ui]`)) {
        return;
      }

      link.remove();
    };
  }, []);

  return null;
}
