import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

/**
 * Lets a page inject content (pills, contextual actions) into the global top
 * nav's left slot. The Header and the page live in different subtrees under
 * Layout, so this bridges them: pages call `useTopNavSlot(node)` to publish,
 * the Header renders `useTopNavSlotContent()`.
 *
 * Pass a memoized node to `useTopNavSlot` (e.g. `useMemo`) so the publish
 * effect doesn't re-fire every render.
 */
type TopNavSlotCtx = {
  content: ReactNode;
  setContent: (node: ReactNode) => void;
};

const TopNavSlotContext = createContext<TopNavSlotCtx | null>(null);

export function TopNavSlotProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  return (
    <TopNavSlotContext.Provider value={{ content, setContent }}>
      {children}
    </TopNavSlotContext.Provider>
  );
}

// Context module: the Provider component lives alongside its hooks by design.
// eslint-disable-next-line react-refresh/only-export-components
export function useTopNavSlotContent(): ReactNode {
  return useContext(TopNavSlotContext)?.content ?? null;
}

/** Publish `node` into the top-nav left slot while this component is mounted. */
// eslint-disable-next-line react-refresh/only-export-components
export function useTopNavSlot(node: ReactNode): void {
  const ctx = useContext(TopNavSlotContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setContent(node);
    return () => ctx.setContent(null);
  }, [ctx, node]);
}
