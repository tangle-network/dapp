'use client';

import { useEffect, useRef, useState } from 'react';

export interface DynamicSVGImportOptions {
  onCompleted?: (
    name: string,
    SvgIcon: React.FC<React.SVGProps<SVGElement>> | undefined,
  ) => void;

  onError?: React.ReactEventHandler<SVGElement>;

  /**
   * The type of icon
   * @default "token"
   */
  type?: 'token' | 'chain';
}

// Use import.meta.glob for Vite-native dynamic imports
// This ensures all SVGs are discovered at build time
const tokenIcons = import.meta.glob('./tokens/*.svg', { eager: false });
const chainIcons = import.meta.glob('./chains/*.svg', { eager: false });

// Default icons imported statically for fallback
import DefaultTokenIcon from './tokens/default.svg';
import DefaultChainIcon from './chains/default.svg';

/**
 * Hook for loading the actual cryptocurrency icon based on the token symbol (e.g. usdt, polkadot, ...)
 * @param _name Represent the token symbol to get the actual icon
 * @param options Represent the option when using the hooks
 * @returns `error`, `loading` and `SvgIcon` in an object
 */
export function useDynamicSVGImport(
  name?: string,
  options: DynamicSVGImportOptions = {},
) {
  const currentNameRef = useRef<string>('');

  const [importedIcon, setImportedIcon] = useState<
    React.ReactElement<React.SVGProps<SVGElement>, 'svg'> | undefined
  >();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;

  const normalizedName =
    typeof name === 'string' ? name.trim().toLowerCase() : 'placeholder';

  const type = options.type ?? 'token';

  useEffect(() => {
    currentNameRef.current = normalizedName;

    setLoading(true);

    const importIcon = async (): Promise<void> => {
      // Store the name we're currently processing
      const processingName = normalizedName;

      try {
        const mod = await getIcon(type, processingName);
        const Icon = mod.default as unknown as React.FC<
          React.SVGProps<SVGElement>
        >;

        // Only update state if this is still the current name
        if (processingName === currentNameRef.current) {
          setImportedIcon(<Icon />);
          onCompleted?.(processingName, Icon);
        }
      } catch (err) {
        const isCurrentNameMatch = processingName === currentNameRef.current;

        // Fallback to default icon
        const DefaultIcon =
          type === 'token'
            ? (DefaultTokenIcon as unknown as React.FC<
                React.SVGProps<SVGElement>
              >)
            : (DefaultChainIcon as unknown as React.FC<
                React.SVGProps<SVGElement>
              >);

        if (isCurrentNameMatch) {
          setImportedIcon(<DefaultIcon />);
          onCompleted?.(processingName, DefaultIcon);
        }
      } finally {
        if (processingName === currentNameRef.current) {
          setLoading(false);
        }
      }
    };

    importIcon().catch(console.error);
  }, [normalizedName, onCompleted, onError, type]);

  return { error, loading, svgElement: importedIcon };
}

async function getIcon(
  type: 'token' | 'chain',
  name: string,
): Promise<{ default: unknown }> {
  const icons = type === 'token' ? tokenIcons : chainIcons;
  const iconPath = `./${type === 'token' ? 'tokens' : 'chains'}/${name}.svg`;

  const loader = icons[iconPath];
  if (!loader) {
    throw new Error(`Icon not found: ${iconPath}`);
  }

  return loader() as Promise<{ default: unknown }>;
}
