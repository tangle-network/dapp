'use client';

import React, { useEffect, useMemo, useState } from 'react';

/**
 * Options for `useDynamicSVGImport` to import cryptocurrency icon dynamically
 */
export interface DynamicSVGImportOptions {
  /**
   * A optional function which is called when finish loading SVG icon
   */
  onCompleted?: (
    name: string,
    SvgIcon: React.FC<React.SVGProps<SVGElement>> | undefined,
  ) => void;
  /**
   * An optional function for handle error when loading SVG icon
   */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;

  const _name = useMemo(
    () =>
      typeof name === 'string' ? name.trim().toLowerCase() : 'placeholder',
    [name],
  );

  const type = useMemo(() => options.type ?? 'token', [options]);

  useEffect(() => {
    setLoading(true);
    const importIcon = async (): Promise<void> => {
      try {
        const module = await getIcon(type, _name);
        const Icon = module.default;
        setImportedIcon(<Icon />);
        onCompleted?.(_name, Icon);
      } catch (err) {
        if ((err as any).message.includes('Cannot find module')) {
          const module = await getDefaultIcon(type);
          const Icon = module.default;
          setImportedIcon(<Icon />);
          onCompleted?.(_name, Icon);
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
  }, [_name, onCompleted, onError, type]);

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
