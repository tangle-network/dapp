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
        const Icon = mod.default;

        // Only update state if this is still the current name and component is still mounted
        if (processingName === currentNameRef.current) {
          setImportedIcon(<Icon />);
          onCompleted?.(processingName, Icon);
        }
      } catch (err) {
        const isCurrentNameMatch = processingName === currentNameRef.current;

        if (
          (err as any).message.includes('Cannot find module') ||
          (err as any).message.includes('Unknown variable dynamic import')
        ) {
          const mod = await getDefaultIcon(type);
          const Icon = mod.default;

          if (isCurrentNameMatch) {
            setImportedIcon(<Icon />);
            onCompleted?.(processingName, Icon);
          }
        } else {
          if (isCurrentNameMatch) {
            onError?.(err as any);
            setError(err as Error);
          }
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

function getIcon(
  type: 'token' | 'chain',
  name: string,
): Promise<typeof import('*.svg')> {
  if (type === 'token') {
    return import(`./tokens/${name}.svg`);
  } else {
    return import(`./chains/${name}.svg`);
  }
}

function getDefaultIcon(type: 'token' | 'chain') {
  if (type === 'token') {
    return import('./tokens/default.svg');
  } else {
    return import('./chains/default.svg');
  }
}
