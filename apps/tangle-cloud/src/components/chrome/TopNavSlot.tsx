import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import StatusPill from './StatusPill';
import type { StatusTone } from '../../styles/chrome';

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

/**
 * Ergonomic publish API for detail pages: declare the entity identity (the
 * section breadcrumb + the entity name), an optional status, and an optional
 * primary action, and this builds the canonical top-nav row and publishes it.
 *
 * This is the single place that owns the breadcrumb + identity + status +
 * action layout, so every detail page reads identically in the chrome without
 * re-implementing truncation, the `ml-auto` action group, or the breadcrumb
 * separator. A detail page adopts the contextual top nav with one call:
 *
 *   useTopNavEntity({
 *     section: 'Instances',
 *     sectionHref: PagePath.INSTANCES,
 *     name: service.name,
 *     status: { label: service.status, tone: statusToneFor('service', service.status) },
 *     actions: <Button size="sm">Submit job</Button>,
 *   });
 *
 * Principle map #8: global controls live in the chrome; the contextual top bar
 * carries entity identity + the single primary action.
 */
export type TopNavEntity = {
  /** Section root label, e.g. "Instances" / "Blueprints". */
  section: string;
  /** Section root href; the label links back to the section catalog. */
  sectionHref: string;
  /** The entity name (truncates). The leaf of the breadcrumb. */
  name: ReactNode;
  /**
   * Optional status pill rendered next to the name — the one canonical badge,
   * never a hand-rolled chip. Use `statusToneFor(domain, status)` for the tone.
   */
  status?: { label: ReactNode; tone: StatusTone };
  /** Optional right-aligned primary action(s). Keep to one button on most pages. */
  actions?: ReactNode;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useTopNavEntity(entity: TopNavEntity | null): void {
  const { section, sectionHref, name, status, actions } = entity ?? {};
  const statusLabel = status?.label;
  const statusTone = status?.tone;

  const node = useMemo<ReactNode>(() => {
    if (!entity) return null;
    return (
      <>
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-sm"
        >
          <Link
            to={sectionHref ?? '#'}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            {section}
          </Link>
          <span aria-hidden className="text-muted-foreground/40">
            /
          </span>
          <span className="truncate font-semibold text-foreground">{name}</span>
        </nav>
        {statusTone !== undefined && (
          <span className="hidden shrink-0 md:inline-flex">
            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          </span>
        )}
        {actions !== undefined && (
          <div className={twMerge('ml-auto flex shrink-0 items-center gap-2')}>
            {actions}
          </div>
        )}
      </>
    );
    // `entity` is included so a null->object transition re-publishes; the
    // primitive fields drive the memo so a parent that rebuilds the object each
    // render (without changing values) doesn't thrash the publish effect.
  }, [entity, section, sectionHref, name, statusLabel, statusTone, actions]);

  useTopNavSlot(node);
}
