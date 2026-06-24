import type { FC, MouseEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import type { BlueprintMode } from '@tangle-network/tangle-shared-ui/blueprintApps/types';
import { twMerge } from 'tailwind-merge';

type Props = {
  modes: BlueprintMode[];
  selectedModeId: string;
  onSelect: (mode: BlueprintMode) => void;
};

/**
 * Detail-page mode picker for blueprints that declare multiple on-chain
 * operational modes (e.g. cloud / instance / TEE). Each mode renders as a
 * card with its label, optional description, and a "Premium" / "Recommended"
 * ribbon when the publisher tagged it. Clicking a card flips the parent's
 * `selectedModeId` state — the parent then updates the iframe URL + posts
 * `tangle:mode` so the embedded app can dispatch without a reload.
 *
 * The component is presentational only — no router writes, no iframe writes,
 * no postMessage. The parent owns selection so navigation behavior stays
 * deterministic across routes (curated landing, raw [id] detail).
 */
const BlueprintModePicker: FC<Props> = ({
  modes,
  selectedModeId,
  onSelect,
}) => {
  if (modes.length === 0) {
    return null;
  }

  return (
    // Shell carries `data-sandbox-ui`; re-applying here would reset the
    // current theme's tokens under this section.
    <section aria-label="Deployment mode" className="space-y-3">
      <header className="space-y-1">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Deployment mode
        </p>
        <h2 className="font-display font-extrabold text-foreground text-lg">
          Pick how this blueprint runs for you
        </h2>
        <p className="text-muted-foreground text-sm">
          Each mode targets a different on-chain deployment with its own
          operator set, isolation guarantees, and attestation requirements.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modes.map((mode) => {
          const isSelected = mode.id === selectedModeId;
          return (
            <Card
              key={mode.id}
              variant="sandbox"
              hover
              className={twMerge(
                'relative cursor-pointer transition-colors',
                isSelected &&
                  'border-primary shadow-[var(--shadow-accent),0_0_0_1px_var(--border-accent)]',
              )}
              onClick={() => onSelect(mode)}
            >
              {mode.tagline && (
                <div
                  className="pointer-events-none absolute right-3 top-3 rounded-full border bg-[var(--accent-surface-soft)] px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
                  style={{
                    borderColor: 'var(--border-accent)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {mode.tagline}
                </div>
              )}
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-foreground text-lg">
                    {mode.label}
                  </h3>
                  {isSelected && (
                    <Badge variant="success" dot>
                      Selected
                    </Badge>
                  )}
                </div>
                {mode.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {mode.description}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="font-mono text-muted-foreground text-[10px] uppercase tracking-wider">
                    Blueprint #{mode.blueprintId}
                  </span>
                  <Button
                    variant={isSelected ? 'sandbox' : 'outline'}
                    size="sm"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      onSelect(mode);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Open'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default BlueprintModePicker;
