import { Button } from '@tangle-network/sandbox-ui/primitives';
import { useMemo, useState, type FC, type ReactNode } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { useTopNavSlot } from '../../components/chrome/TopNavSlot';
import type {
  BlueprintMode,
  BlueprintUiAction,
  BlueprintUiOverviewCard,
  BlueprintUiTheme,
} from '@tangle-network/tangle-shared-ui/blueprintApps/types';
import { focus, typeRole } from '../../styles/chrome';
import type { BlueprintIframeConfig } from '../iframe/types';
import BlueprintAppFrameHost from './BlueprintAppFrameHost';
import BlueprintModePicker from './BlueprintModePicker';

type Props = {
  iframeConfig: BlueprintIframeConfig;
  displayName: string;
  tagline?: string;
  description?: string;
  serviceNoun: string;
  /** Resolved deploy/provision route, used by the "Create instance" CTA. */
  provisionPath: string;
  /** Optional protocol-generic detail route for the "Details" panel link-out. */
  protocolDetailHref?: string;
  /** Optional publisher console (external app's standalone URL). */
  externalAppUrl?: string;
  /** Mode picker — only rendered when there are 2+ modes. */
  modes: BlueprintMode[];
  activeMode: BlueprintMode | null;
  onSelectMode: (modeId: string) => void;
  /** Blueprint id forwarded to the iframe so it knows which deployment it's
   * embedded under. */
  blueprintId: bigint | number | undefined;
  /** Publisher-declared overview cards rendered inside the Details panel. */
  overviewCards: BlueprintUiOverviewCard[];
  /** Publisher-declared action launchers rendered inside the Details panel. */
  actions: BlueprintUiAction[];
  /** Optional theme accent forwarded to the iframe surround. */
  theme?: BlueprintUiTheme;
};

/**
 * Layout for blueprints that ship a publisher-hosted iframe app.
 *
 * Design intent: when a publisher provides a real product (full app with its
 * own header, branding, hero, and navigation), the dapp should NOT wrap that
 * product in a second hero of its own. The iframe IS the page. Our chrome
 * sits at the periphery: a 44px top strip for blueprint identity + the
 * "Create instance" CTA + a Details disclosure, and the iframe takes the
 * rest of the viewport height.
 *
 * Compare to the procedural layout (no iframe): there we DO own the page
 * surface, so a hero + checkout-path + overview-cards stack is appropriate.
 * Mode-driven layout split is the senior move — same component shape, two
 * very different visual hierarchies driven by whether the publisher ships
 * their own UI.
 *
 * Details panel: slides in from the right with the blueprint's tagline,
 * description, modes (if multi), overview cards, actions, and the "View
 * on-chain" escape hatch. Closed by default — discoverable, not in the way.
 */
const IframeBlueprintLayout: FC<Props> = ({
  iframeConfig,
  displayName,
  tagline,
  description,
  serviceNoun,
  provisionPath,
  protocolDetailHref,
  externalAppUrl,
  modes,
  activeMode,
  onSelectMode,
  blueprintId,
  overviewCards,
  actions,
  theme,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const accentStyle = theme?.accentColor
    ? ({
        ['--blueprint-accent' as string]: theme.accentColor,
      } as React.CSSProperties)
    : undefined;

  // Blueprint identity + primary CTA + Details disclosure live in the global
  // top nav (as pills) rather than a second in-page bar — that bar wasted a
  // full row and pushed the iframe down. See useTopNavSlot / Header left slot.
  const navContent = useMemo(
    () => (
      <>
        {/* Breadcrumb trail: Blueprints / <name> — matches the route trail
         * style used across the app; the section root links to the catalog. */}
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-[13px]"
        >
          <Link
            to="/blueprints"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            Blueprints
          </Link>
          <span aria-hidden className="text-muted-foreground/40">
            /
          </span>
          <span className="truncate font-semibold text-foreground">
            {displayName}
          </span>
        </nav>
        {modes.length > 1 && activeMode && (
          <div className="hidden shrink-0 md:block">
            <CompactModePicker
              modes={modes}
              activeId={activeMode.id}
              onSelect={onSelectMode}
            />
          </div>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button asChild variant="sandbox" size="sm">
            <Link to={provisionPath}>Create {serviceNoun}</Link>
          </Button>
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            aria-controls="blueprint-details-panel"
            className={twMerge(
              'inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-[color:var(--bg-hover)]',
              detailsOpen && 'border-[color:var(--border-accent-hover)]',
              focus.ring,
            )}
          >
            <InfoIcon className="h-3.5 w-3.5" />
            Details
          </button>
        </div>
      </>
    ),
    [
      displayName,
      modes,
      activeMode,
      onSelectMode,
      provisionPath,
      serviceNoun,
      detailsOpen,
    ],
  );
  useTopNavSlot(navContent);

  return (
    <div className="relative -mx-4 -mb-10 -mt-6 md:-mx-8" style={accentStyle}>
      {/* No in-page identity bar — it lives in the top nav now. The iframe
       * fills the full height below the topbar. The small padding leaves a
       * rounded gutter around the rounded iframe so it reads as a contained
       * surface; the parent never scrolls — the app inside the iframe manages
       * its own scroll. */}
      <div
        className={twMerge(
          'relative overflow-hidden',
          // 56 = top nav (Layout). No identity strip anymore.
          'h-[calc(100vh-56px)] min-h-[480px] p-2 md:p-3',
        )}
      >
        <BlueprintAppFrameHost
          config={iframeConfig}
          appDisplayName={displayName}
          mode={activeMode?.id}
          blueprintId={activeMode?.blueprintId ?? blueprintId}
        />
      </div>

      {/* Mobile mode picker — lives in the panel instead of the strip on
       * narrow viewports. Surfaced here so it doesn't crowd the strip. */}
      {modes.length > 1 && activeMode && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <BlueprintModePicker
            modes={modes}
            selectedModeId={activeMode.id}
            onSelect={(mode) => onSelectMode(mode.id)}
          />
        </div>
      )}

      {/* Details slide-over. Opens from the right; covers ~480px of the
       * viewport on desktop, full width on mobile. The iframe stays
       * interactive behind the dimmed scrim — no modal trap. */}
      <DetailsPanel
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        displayName={displayName}
        tagline={tagline}
        description={description}
        overviewCards={overviewCards}
        actions={actions}
        provisionPath={provisionPath}
        protocolDetailHref={protocolDetailHref}
        externalAppUrl={externalAppUrl}
      />
    </div>
  );
};

export default IframeBlueprintLayout;

// ── Compact mode picker (in-strip variant) ───────────────────────────────────

const CompactModePicker: FC<{
  modes: BlueprintMode[];
  activeId: string;
  onSelect: (modeId: string) => void;
}> = ({ modes, activeId, onSelect }) => (
  <div
    role="radiogroup"
    aria-label="Deployment mode"
    className="inline-flex h-8 items-center rounded-md border border-border bg-transparent p-0.5"
  >
    {modes.map((mode) => {
      const active = mode.id === activeId;
      return (
        <button
          key={mode.id}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onSelect(mode.id)}
          className={twMerge(
            'h-7 rounded px-2.5 text-xs font-medium transition-colors',
            active
              ? 'bg-[color:var(--bg-hover)] text-foreground'
              : 'text-muted-foreground hover:text-foreground',
            focus.ring,
          )}
        >
          {mode.label}
        </button>
      );
    })}
  </div>
);

// ── Details slide-over panel ─────────────────────────────────────────────────

type DetailsPanelProps = {
  open: boolean;
  onClose: () => void;
  displayName: string;
  tagline?: string;
  description?: string;
  overviewCards: BlueprintUiOverviewCard[];
  actions: BlueprintUiAction[];
  provisionPath: string;
  protocolDetailHref?: string;
  externalAppUrl?: string;
};

const DetailsPanel: FC<DetailsPanelProps> = ({
  open,
  onClose,
  displayName,
  tagline,
  description,
  overviewCards,
  actions,
  provisionPath,
  protocolDetailHref,
  externalAppUrl,
}) => {
  return (
    <>
      {/* Scrim — dims the iframe so the panel reads as a layer above. The
       * scrim itself is non-interactive on click-through to avoid trapping
       * the iframe; closing happens via the explicit close button or Esc. */}
      <div
        aria-hidden
        className={twMerge(
          'fixed inset-0 z-30 bg-background/40 backdrop-blur-[2px] transition-opacity',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        id="blueprint-details-panel"
        role="dialog"
        aria-label={`${displayName} details`}
        aria-hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        className={twMerge(
          'fixed inset-y-0 right-0 z-40 w-full max-w-[480px] overflow-y-auto border-l border-border bg-[color:var(--bg-card)] shadow-2xl transition-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-[color:var(--bg-card)] px-5 py-3">
          <h2 className={twMerge(typeRole.section, 'truncate')}>
            {displayName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className={twMerge(
              'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--bg-hover)] hover:text-foreground',
              focus.ring,
            )}
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5">
          {tagline !== undefined && tagline.length > 0 && (
            <p className="text-base leading-relaxed text-foreground">
              {tagline}
            </p>
          )}
          {description !== undefined && description.length > 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {/* Primary action repeated inside the panel for users who opened
           * Details first to read context, then want to act without
           * scrolling back to the top strip. */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm">
              <Link to={provisionPath}>Create instance</Link>
            </Button>
            {externalAppUrl && (
              <Button asChild variant="ghost" size="sm">
                <a href={externalAppUrl} target="_blank" rel="noreferrer">
                  Open standalone ↗
                </a>
              </Button>
            )}
            {protocolDetailHref && (
              <Button asChild variant="ghost" size="sm">
                <Link to={protocolDetailHref}>View on-chain</Link>
              </Button>
            )}
          </div>

          {/* Publisher actions — same content as the procedural layout's
           * ActionLauncher, but list-shaped to fit the narrow panel. */}
          {actions.length > 0 && (
            <DetailsSection title="What you can do">
              <ul className="divide-y divide-border rounded-md border border-border bg-background">
                {actions.slice(0, 8).map((action) => (
                  <li key={action.id}>
                    <ActionRow action={action} provisionPath={provisionPath} />
                  </li>
                ))}
              </ul>
            </DetailsSection>
          )}

          {/* Overview cards — rendered inline as text rows here, not as the
           * full grid component, because the panel is narrow and the
           * publisher's primary surface (the iframe) is already conveying
           * most of this content visually. */}
          {overviewCards.length > 0 && (
            <DetailsSection title="Overview">
              <div className="space-y-3">
                {overviewCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    <div className={twMerge(typeRole.label, 'mb-1')}>
                      {card.title}
                    </div>
                    {'value' in card && card.value !== undefined && (
                      <p className="font-mono text-base font-semibold tabular-nums text-foreground">
                        {card.value}
                      </p>
                    )}
                    {card.description && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>
                    )}
                    {'items' in card && card.items && card.items.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs leading-relaxed text-foreground/90">
                        {card.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {'links' in card && card.links && card.links.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {card.links.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-foreground hover:underline"
                            >
                              {link.label} ↗
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </DetailsSection>
          )}
        </div>
      </aside>
    </>
  );
};

const DetailsSection: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-2">
    <h3 className={typeRole.label}>{title}</h3>
    {children}
  </section>
);

const ActionRow: FC<{
  action: BlueprintUiAction;
  provisionPath: string;
}> = ({ action, provisionPath }) => {
  const submitLabel = action.submitLabel ?? action.label;
  const inner = (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-[color:var(--bg-hover)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {action.label}
        </p>
        {action.description && (
          <p className="truncate text-xs text-muted-foreground">
            {action.description}
          </p>
        )}
      </div>
      <span className="shrink-0 text-xs font-semibold text-foreground/70">
        {submitLabel} →
      </span>
    </div>
  );
  if (action.href) {
    return (
      <a href={action.href} target="_blank" rel="noreferrer" className="block">
        {inner}
      </a>
    );
  }
  const to =
    action.target === 'service'
      ? `/instances?action=${encodeURIComponent(action.id)}`
      : `${provisionPath}?action=${encodeURIComponent(action.id)}`;
  return (
    <Link to={to} className="block">
      {inner}
    </Link>
  );
};

// ── Inline icons ─────────────────────────────────────────────────────────────

const InfoIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 6h2v2h-2V8zm0 4h2v6h-2v-6z" />
  </svg>
);
