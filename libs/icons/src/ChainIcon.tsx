import { cloneElement, useMemo } from 'react';
import Spinner from './Spinner';
import StatusIndicator from './StatusIndicator/StatusIndicator';
import { StatusIndicatorProps } from './StatusIndicator/types';
import { useDynamicSVGImport } from './useDynamicSVGImport';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';

export const ChainIcon: React.FC<
  TokenIconBase & {
    status?: StatusIndicatorProps['variant'];
    spinnerSize?: TokenIconBase['size'];
  }
> = ({ status, spinnerSize, ...props }) => {
  const {
    className,
    name: nameProp,
    onCompleted,
    onError,
    size = 'md',
    ...restProps
  } = props;

  const name = useMemo(() => {
    const chainName = nameProp?.toLowerCase() || '';
    if (chainName.includes('tangle') && !chainName.includes('transparent')) {
      return 'tangle';
    }
    return chainName.replace(/\s/g, '-');
  }, [nameProp]);

  const { svgElement, error, loading } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
    type: 'chain',
  });

  if (error) {
    return <span>{error.message}</span>;
  }

  if (loading) {
    return <Spinner {...props} size={spinnerSize} />;
  }

  if (svgElement) {
    const sizeInPx = getIconSizeInPixel(size);
    const sizeInNumber = parseInt(sizeInPx);
    const props: React.SVGProps<SVGElement> = {
      className,
      width: sizeInNumber,
      height: sizeInNumber,
      ...restProps,
    };

    return typeof status !== 'undefined' ? (
      <div className="relative">
        {cloneElement(svgElement, props)}
        <StatusIndicator
          variant={status}
          size={sizeInNumber / 2}
          className="absolute inline-block"
          style={{
            top: -(sizeInNumber / 4),
            right: -(sizeInNumber / 4),
          }}
        />
      </div>
    ) : (
      cloneElement(svgElement, props)
    );
  }

  return null;
};
