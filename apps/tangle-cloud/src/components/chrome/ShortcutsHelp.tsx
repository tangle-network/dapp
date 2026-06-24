import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@tangle-network/sandbox-ui/primitives';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { typeRole } from '../../styles/chrome';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SHORTCUTS: Array<{
  group: string;
  rows: Array<{ keys: string[]; label: string }>;
}> = [
  {
    group: 'Navigate',
    rows: [
      { keys: ['g', 'b'], label: 'Blueprints' },
      { keys: ['g', 'o'], label: 'Operators' },
      { keys: ['g', 'i'], label: 'Instances' },
      { keys: ['g', 'r'], label: 'Rewards' },
      { keys: ['g', 'e'], label: 'Earnings' },
      { keys: ['g', 'm'], label: 'Manage your blueprints' },
    ],
  },
  {
    group: 'Actions',
    rows: [
      { keys: ['⌘', 'K'], label: 'Command palette (anywhere)' },
      { keys: ['/'], label: 'Focus page search' },
      { keys: ['?'], label: 'This help overlay' },
    ],
  },
  {
    group: 'Lists & catalogs',
    rows: [
      { keys: ['↑', '↓'], label: 'Move selection' },
      { keys: ['↵'], label: 'Open selected item' },
      { keys: ['esc'], label: 'Close overlay / clear focus' },
    ],
  },
];

const Kbd: FC<{ children: string }> = ({ children }) => (
  <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-[color:var(--bg-elevated)]/60 px-1.5 font-mono text-xs text-foreground">
    {children}
  </kbd>
);

/**
 * `?`-summoned reference. Lists the entire keyboard surface so an operator
 * doesn't have to read code to discover the shortcuts. Mirrors the palette's
 * shape (groups + rows + mono key chips) so the visual language is consistent.
 */
const ShortcutsHelp: FC<Props> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[480px] gap-0 border border-border bg-[color:var(--bg-card)] p-6">
      <DialogHeader>
        <DialogTitle className={twMerge(typeRole.section)}>
          Keyboard shortcuts
        </DialogTitle>
      </DialogHeader>
      <div className="mt-4 space-y-5">
        {SHORTCUTS.map((section) => (
          <div key={section.group}>
            <div className={twMerge(typeRole.label, 'mb-2')}>
              {section.group}
            </div>
            <div className="space-y-1.5">
              {section.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm text-foreground"
                >
                  <span>{row.label}</span>
                  <span className="flex items-center gap-1">
                    {row.keys.map((k, j) => (
                      <Kbd key={j}>{k}</Kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default ShortcutsHelp;
