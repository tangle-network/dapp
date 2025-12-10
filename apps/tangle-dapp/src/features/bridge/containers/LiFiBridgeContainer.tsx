'use client';

import { LiFiWidget, type WidgetConfig } from '@lifi/widget';
import { FC, useMemo } from 'react';
import { base } from 'viem/chains';

const LiFiBridgeContainer: FC = () => {
  const widgetConfig: Partial<WidgetConfig> = useMemo(
    () => ({
      variant: 'wide',
      subvariant: 'default',
      appearance: 'dark',
      theme: {
        container: {
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
        palette: {
          primary: {
            main: '#8B5CF6',
          },
          secondary: {
            main: '#EC4899',
          },
          background: {
            paper: '#1f1f1f',
            default: '#121212',
          },
        },
        shape: {
          borderRadius: 12,
          borderRadiusSecondary: 8,
        },
      },
      // Set default destination chain to Base
      toChain: base.id,
      // Hide chains we don't want
      hiddenUI: ['poweredBy'],
      // Allow any token bridging
      bridges: {
        allow: [
          'across',
          'stargate',
          'hop',
          'cbridge',
          'hyphen',
          'multichain',
          'connext',
          'squid',
          'allbridge',
          'amarok',
        ],
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col items-center justify-center w-full py-8">
      <div className="w-full max-w-[480px]">
        <LiFiWidget integrator="tangle-network" config={widgetConfig} />
      </div>
    </div>
  );
};

export default LiFiBridgeContainer;
