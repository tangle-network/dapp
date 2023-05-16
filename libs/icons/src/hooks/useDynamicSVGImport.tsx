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
    SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> | undefined
  ) => void;
  /**
   * An optional function for handle error when loading SVG icon
   */
  onError?: React.ReactEventHandler<SVGSVGElement>;

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
  name: string,
  options: DynamicSVGImportOptions = {}
) {
  const [importedIcon, setImportedIcon] = useState<
    React.ReactElement<React.SVGProps<SVGSVGElement>, 'svg'> | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;

  const _name = useMemo(() => name.trim().toLowerCase(), [name]);
  const type = useMemo(() => options.type ?? 'token', [options]);

  useEffect(() => {
    setLoading(true);
    const importIcon = async (): Promise<void> => {
      try {
        const module = await import(`../${type}s/${_name}.svg?svgr`);
        const Icon = module.default;
        setImportedIcon(Icon());
        onCompleted?.(_name, Icon);
      } catch (err) {
        if ((err as any).message.includes('Cannot find module')) {
          const module = await import(`../${type}s/default.svg?svgr`);
          const Icon = module.default;
          setImportedIcon(Icon());
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
  }, [_name, onCompleted, onError]);

  return { error, loading, svgElement: importedIcon };
}
