'use client';

import { LiFiWidget, type WidgetConfig } from '@lifi/widget';
import { FC, useMemo } from 'react';
import { base } from 'viem/chains';

// Tangle dark theme colors (from tailwind.preset.ts)
const TANGLE_COLORS = {
  // Backgrounds
  bgDefault: '#10101A', // mono-200 - darkest
  bgPaper: '#1D1D2B', // mono-180 - card background
  bgCard: '#2B2F40', // mono-170 - elevated surfaces
  // Primary (purple)
  primary: '#5953F9', // purple-50
  primaryLight: '#7A75FF', // purple-40
  primaryDark: '#433ED9', // purple-60
  // Text
  textPrimary: '#FFFFFF', // mono-0
  textSecondary: '#9C9FB0', // mono-100
  textDisabled: '#6C6F80', // mono-120
  // Borders
  border: '#3A3E53', // mono-160
  borderLight: '#4E5263', // mono-140
  // Success/Error
  success: '#4CB457', // green-50
  error: '#EF570D', // red-50
  warning: '#F4C328', // yellow-60
} as const;

// Satoshi font stack matching the app
const FONT_FAMILY =
  "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const LiFiBridgeContainer: FC = () => {
  const widgetConfig: Partial<WidgetConfig> = useMemo(
    () => ({
      variant: 'wide',
      subvariant: 'default',
      appearance: 'dark',
      theme: {
        container: {
          borderRadius: '12px',
          boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${TANGLE_COLORS.border}`,
        },
        palette: {
          mode: 'dark',
          primary: {
            main: TANGLE_COLORS.primary,
            light: TANGLE_COLORS.primaryLight,
            dark: TANGLE_COLORS.primaryDark,
          },
          secondary: {
            main: TANGLE_COLORS.primaryLight,
          },
          background: {
            paper: TANGLE_COLORS.bgPaper,
            default: TANGLE_COLORS.bgDefault,
          },
          text: {
            primary: TANGLE_COLORS.textPrimary,
            secondary: TANGLE_COLORS.textSecondary,
          },
          grey: {
            100: TANGLE_COLORS.borderLight,
            200: TANGLE_COLORS.border,
            300: TANGLE_COLORS.borderLight,
            400: TANGLE_COLORS.textDisabled,
            500: TANGLE_COLORS.textSecondary,
            600: TANGLE_COLORS.bgCard,
            700: TANGLE_COLORS.bgCard,
            800: TANGLE_COLORS.bgPaper,
            900: TANGLE_COLORS.bgDefault,
          },
          success: {
            main: TANGLE_COLORS.success,
          },
          error: {
            main: TANGLE_COLORS.error,
          },
          warning: {
            main: TANGLE_COLORS.warning,
          },
          divider: TANGLE_COLORS.border,
        },
        shape: {
          borderRadius: 8,
          borderRadiusSecondary: 6,
        },
        typography: {
          fontFamily: FONT_FAMILY,
          // Override all MUI typography variants to use Satoshi
          h1: { fontFamily: FONT_FAMILY },
          h2: { fontFamily: FONT_FAMILY },
          h3: { fontFamily: FONT_FAMILY },
          h4: { fontFamily: FONT_FAMILY },
          h5: { fontFamily: FONT_FAMILY },
          h6: { fontFamily: FONT_FAMILY },
          subtitle1: { fontFamily: FONT_FAMILY },
          subtitle2: { fontFamily: FONT_FAMILY },
          body1: { fontFamily: FONT_FAMILY },
          body2: { fontFamily: FONT_FAMILY },
          button: { fontFamily: FONT_FAMILY },
          caption: { fontFamily: FONT_FAMILY },
          overline: { fontFamily: FONT_FAMILY },
        },
        components: {
          MuiCard: {
            defaultProps: {
              variant: 'outlined',
            },
            styleOverrides: {
              root: {
                backgroundColor: TANGLE_COLORS.bgPaper,
                borderColor: TANGLE_COLORS.border,
              },
            },
          },
          MuiInputCard: {
            styleOverrides: {
              root: {
                backgroundColor: TANGLE_COLORS.bgCard,
                borderColor: TANGLE_COLORS.border,
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                fontFamily: FONT_FAMILY,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                fontFamily: FONT_FAMILY,
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                fontFamily: FONT_FAMILY,
              },
              input: {
                fontFamily: FONT_FAMILY,
              },
            },
          },
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
      {/* z-index container to ensure dropdowns appear above the widget */}
      <div className="lifi-widget-wrapper w-full max-w-[480px] relative z-0">
        <LiFiWidget integrator="tangle-network" config={widgetConfig} />
      </div>

      {/* Force Satoshi font on all LiFi widget elements */}
      <style>{`
        .lifi-widget-wrapper * {
          font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default LiFiBridgeContainer;
