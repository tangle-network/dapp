import { forwardRef as reactForwardRef } from 'react';

/**
 * The React forwardRef function not working well with
 * generic components.
 */
export default function forwardRef<T, P = Record<string, never>>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode,
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return reactForwardRef(render) as any;
}
