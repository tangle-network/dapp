'use client';

import React, { useEffect, useState } from 'react';

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
  const [importedIcon, setImportedIcon] = useState<
    React.ReactElement<React.SVGProps<SVGElement>, 'svg'> | undefined
  >();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;

  const name_ =
    typeof name === 'string' ? name.trim().toLowerCase() : 'placeholder';

  const type = options.type ?? 'token';

  useEffect(() => {
    setLoading(true);

    const importIcon = async (): Promise<void> => {
      try {
        const mod = await getIcon(type, name_);
        const Icon = mod.default;

        setImportedIcon(<Icon />);
        onCompleted?.(name_, Icon);
      } catch (err) {
        if (
          (err as any).message.includes('Cannot find module') ||
          (err as any).message.includes('Unknown variable dynamic import')
        ) {
          const mod = await getDefaultIcon(type);
          const Icon = mod.default;

          setImportedIcon(<Icon />);
          onCompleted?.(name_, Icon);
        } else {
          console.error('IMPORT ERROR', (err as any).message);
          onError?.(err as any);
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    importIcon();
  }, [name_, onCompleted, onError, type]);

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
