'use client';

import { LiFiWidget, type WidgetConfig } from '@lifi/widget';
import { FC, useMemo } from 'react';
import { base } from 'viem/chains';
import { useDarkMode } from '@tangle-network/ui-components';

// Tangle dark theme colors (from tailwind.preset.ts)
const DARK_COLORS = {
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

// Tangle light theme colors
const LIGHT_COLORS = {
  // Backgrounds
  bgDefault: '#FFFFFF', // mono-0
  bgPaper: '#F7F8F7', // mono-20
  bgCard: '#ECEDEC', // mono-40
  // Primary (purple)
  primary: '#5953F9', // purple-50
  primaryLight: '#7A75FF', // purple-40
  primaryDark: '#433ED9', // purple-60
  // Text
  textPrimary: '#10101A', // mono-200
  textSecondary: '#6C6F80', // mono-120
  textDisabled: '#9C9FB0', // mono-100
  // Borders
  border: '#D6D8DA', // mono-60
  borderLight: '#ECEDEC', // mono-40
  // Success/Error
  success: '#4CB457', // green-50
  error: '#EF570D', // red-50
  warning: '#F4C328', // yellow-60
} as const;

// Satoshi font stack matching the app
const FONT_FAMILY =
  "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const LiFiBridgeContainer: FC = () => {
  const [isDarkMode] = useDarkMode();
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const widgetConfig: Partial<WidgetConfig> = useMemo(
    () => ({
      variant: 'wide',
      subvariant: 'default',
      appearance: isDarkMode ? 'dark' : 'light',
      theme: {
        container: {
          borderRadius: '12px',
          boxShadow: isDarkMode
            ? '0 4px 24px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 24px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.border}`,
        },
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: colors.primary,
            light: colors.primaryLight,
            dark: colors.primaryDark,
          },
          secondary: {
            main: colors.primaryLight,
          },
          background: {
            paper: colors.bgPaper,
            default: colors.bgDefault,
          },
          text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
          },
          grey: {
            100: colors.borderLight,
            200: colors.border,
            300: colors.borderLight,
            400: colors.textDisabled,
            500: colors.textSecondary,
            600: colors.bgCard,
            700: colors.bgCard,
            800: colors.bgPaper,
            900: colors.bgDefault,
          },
          success: {
            main: colors.success,
          },
          error: {
            main: colors.error,
          },
          warning: {
            main: colors.warning,
          },
          divider: colors.border,
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
                backgroundColor: colors.bgPaper,
                borderColor: colors.border,
              },
            },
          },
          MuiInputCard: {
            styleOverrides: {
              root: {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
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
    [isDarkMode, colors],
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
