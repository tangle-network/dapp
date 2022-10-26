import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DefaultTokenIcon } from '../icons/DefaultTokenIcon';

/**
 * Options for `useDynamicSVGImport` to import cryptocurrency icon dynamically
 */
export interface DynamicSVGImportOptions {
  /**
   * A optional function which is called when finish loading SVG icon
   */
  onCompleted?: (
    name: string,
    SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> | undefined
  ) => void;
  /**
   * An optional function for handle error when loading SVG icon
   */
  onError?: React.ReactEventHandler<SVGSVGElement>;
}

/**
 * Hook for loading the actual cryptocurrency icon based on the token symbol (e.g. usdt, polkadot, ...)
 * @param _name Represent the token symbol to get the actual icon
 * @param options Represent the option when using the hooks
 * @returns `error`, `loading` and `SvgIcon` in an object
 */
export function useDynamicSVGImport(
  name: string,
  options: DynamicSVGImportOptions = {}
) {
  const ImportedIconRef = useRef<React.FC<React.SVGProps<SVGSVGElement>>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;

  const _name = useMemo(() => name.trim().toLowerCase(), [name]);

  useEffect(() => {
    setLoading(true);
    const importIcon = async (): Promise<void> => {
      try {
        ImportedIconRef.current = (
          await import(
            `!!@svgr/webpack?+svgo,+titleProp,+ref!../icons/tokens/${_name}.svg`
          )
        ).default;
        onCompleted?.(_name, ImportedIconRef.current);
      } catch (err) {
        if ((err as any).message.includes('Cannot find module')) {
          ImportedIconRef.current = DefaultTokenIcon;
          onCompleted?.(_name, ImportedIconRef.current);
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
  }, [_name, onCompleted, onError]);

  return { error, loading, SvgIcon: ImportedIconRef.current };
}
