import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@tangle-network/sandbox-ui/primitives';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { focus, typeRole } from '../../styles/chrome';
import { PagePath } from '../../types';

export type Command = {
  /** Unique stable id for keying + persistence. */
  id: string;
  /** Primary label shown in the palette. */
  label: string;
  /** Optional secondary text, e.g. "Catalog" or "Operator action". */
  group?: string;
  /** Optional leading glyph (rendered 16px). */
  icon?: ReactNode;
  /** Optional keyboard hint (e.g. "g b"). */
  shortcut?: string;
  /** What to do when chosen. Either navigate to a path or run a side-effect. */
  perform: () => void;
  /** Tokens that match a query against this command. Auto-derived if absent. */
  keywords?: string[];
};

type Props = {
  /** Open state. Controlled — caller decides when to show. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Caller-supplied commands. Built-in nav commands are prepended automatically. */
  extra?: Command[];
};

/** Built-in navigation commands available everywhere. */
const useBuiltinCommands = (close: () => void): Command[] => {
  const navigate = useNavigate();
  return useMemo(
    () => [
      {
        id: 'nav:blueprints',
        label: 'Go to Blueprints',
        group: 'Navigate',
        shortcut: 'g b',
        keywords: ['blueprints', 'catalog'],
        perform: () => {
          navigate(PagePath.BLUEPRINTS);
          close();
        },
      },
      {
        id: 'nav:operators',
        label: 'Go to Operators',
        group: 'Navigate',
        shortcut: 'g o',
        keywords: ['operators', 'directory'],
        perform: () => {
          navigate(PagePath.OPERATORS);
          close();
        },
      },
      {
        id: 'nav:rewards',
        label: 'Go to Rewards',
        group: 'Navigate',
        shortcut: 'g r',
        keywords: ['rewards', 'claims'],
        perform: () => {
          navigate(PagePath.REWARDS);
          close();
        },
      },
      {
        id: 'nav:earnings',
        label: 'Go to Earnings',
        group: 'Navigate',
        shortcut: 'g e',
        keywords: ['earnings', 'payouts'],
        perform: () => {
          navigate(PagePath.EARNINGS);
          close();
        },
      },
      {
        id: 'nav:instances',
        label: 'Go to Instances',
        group: 'Navigate',
        shortcut: 'g i',
        keywords: ['instances', 'services', 'dashboard'],
        perform: () => {
          navigate(PagePath.INSTANCES);
          close();
        },
      },
      {
        id: 'nav:blueprints-manage',
        label: 'Manage your blueprints',
        group: 'Navigate',
        keywords: ['manage', 'publish', 'admin'],
        perform: () => {
          navigate(PagePath.BLUEPRINTS_MANAGE);
          close();
        },
      },
    ],
    [navigate, close],
  );
};

const matches = (cmd: Command, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  if (cmd.label.toLowerCase().includes(q)) return true;
  if (cmd.group?.toLowerCase().includes(q)) return true;
  if (cmd.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
  return false;
};

/**
 * ⌘K command palette. The primary navigation surface at this product tier —
 * every page is one keystroke away, every action a publisher or operator can
 * take is searchable.
 *
 * Implementation is intentionally cmdk-free — `cmdk` would be one more dep
 * for a thin layer on top of Dialog + filtered list. The palette already does
 * everything we need: case-insensitive label/group/keyword match, j/k +
 * arrow-key navigation, Enter to execute, Esc to close.
 */
const CommandPalette: FC<Props> = ({ open, onOpenChange, extra = [] }) => {
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const builtins = useBuiltinCommands(close);
  const all = useMemo(() => [...builtins, ...extra], [builtins, extra]);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(
    () => all.filter((cmd) => matches(cmd, query)),
    [all, query],
  );

  // Reset on open / collapse on close so the next invocation starts fresh.
  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setQuery('');
        setActiveIndex(0);
      });
      // Focus on next tick so the Dialog's autofocus doesn't steal it.
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    queueMicrotask(() => {
      setActiveIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
    });
  }, [filtered.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || (e.key === 'j' && e.ctrlKey)) {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp' || (e.key === 'k' && e.ctrlKey)) {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = filtered[activeIndex];
      if (chosen) chosen.perform();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  // Group commands by `group`, preserving insertion order. Ungrouped commands
  // end up under "Actions".
  const grouped = useMemo(() => {
    const out = new Map<string, Command[]>();
    for (const cmd of filtered) {
      const key = cmd.group ?? 'Actions';
      const list = out.get(key) ?? [];
      list.push(cmd);
      out.set(key, list);
    }
    return Array.from(out.entries());
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={twMerge(
          'top-[20%] max-w-[640px] translate-y-0 gap-0 overflow-hidden p-0',
          'border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-mono-0 dark:bg-mono-180)]',
        )}
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an action, page, or blueprint…"
          className={twMerge(
            'h-12 w-full border-b border-mono-60 dark:border-mono-170 bg-transparent px-4 text-sm text-mono-200 dark:text-mono-0 placeholder:text-mono-120 dark:text-mono-100/70',
            focus.ring,
          )}
        />
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-mono-120 dark:text-mono-100">
              No matching actions.
            </div>
          ) : (
            grouped.map(([group, cmds]) => (
              <div key={group} className="pb-2">
                <div className={twMerge(typeRole.label, 'px-4 py-1.5')}>
                  {group}
                </div>
                {cmds.map((cmd) => {
                  const cmdIndex = filtered.indexOf(cmd);
                  const active = cmdIndex === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(cmdIndex)}
                      onClick={() => cmd.perform()}
                      className={twMerge(
                        'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                        active
                          ? 'bg-[color:var(--bg-hover)] text-mono-200 dark:text-mono-0'
                          : 'text-mono-120 dark:text-mono-100 hover:text-mono-200 dark:text-mono-0',
                      )}
                    >
                      {cmd.icon !== undefined && (
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-mono-120 dark:text-mono-100">
                          {cmd.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{cmd.label}</span>
                      {cmd.shortcut !== undefined && (
                        <kbd className="hidden rounded border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-elevated)]/60 px-1.5 py-0.5 font-mono text-[10px] text-mono-120 dark:text-mono-100 sm:inline-block">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-mono-60 dark:border-mono-170 px-4 py-2 text-xs text-mono-120 dark:text-mono-100">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-elevated)]/60 px-1 font-mono">
                ↑↓
              </kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="rounded border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-elevated)]/60 px-1 font-mono">
                ↵
              </kbd>{' '}
              execute
            </span>
            <span>
              <kbd className="rounded border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-elevated)]/60 px-1 font-mono">
                esc
              </kbd>{' '}
              close
            </span>
          </div>
          <span className="font-mono">
            {filtered.length} / {all.length}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
