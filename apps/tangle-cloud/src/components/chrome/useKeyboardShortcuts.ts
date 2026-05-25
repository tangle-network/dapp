import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';

/**
 * Wire global keyboard shortcuts:
 *
 *   ⌘K / Ctrl+K  → open command palette
 *   /            → focus the page search input (if one is mounted)
 *   g b          → navigate to /blueprints
 *   g o          → /operators
 *   g r          → /rewards
 *   g e          → /earnings
 *   g i          → /instances
 *   ?            → open keyboard-shortcuts help overlay
 *
 * Shortcuts only fire when no input/textarea/contenteditable element is
 * focused — never hijack typing.
 */
export function useKeyboardShortcuts({
  onOpenPalette,
  onOpenHelp,
}: {
  onOpenPalette: () => void;
  onOpenHelp: () => void;
}) {
  const navigate = useNavigate();
  // "g" prefix state — once g is pressed we wait briefly for the next key.
  const gPending = useRef<{ at: number; timer: number } | null>(null);

  useEffect(() => {
    const clearGPending = () => {
      if (gPending.current) {
        window.clearTimeout(gPending.current.timer);
        gPending.current = null;
      }
    };

    const isEditableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
        return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K — opens regardless of focus (so the user can summon the
      // palette from anywhere, including while typing in an input).
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        clearGPending();
        onOpenPalette();
        return;
      }

      // Everything else only fires outside text inputs.
      if (isEditableTarget(e.target)) return;

      // `?` (shift+/) opens the help overlay.
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        clearGPending();
        onOpenHelp();
        return;
      }

      // `/` focuses the first <input type="search"> on the page (page toolbar).
      if (e.key === '/' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const search = document.querySelector<HTMLInputElement>(
          'input[type="search"]',
        );
        if (search) {
          e.preventDefault();
          clearGPending();
          search.focus();
          return;
        }
      }

      // `g` starts a navigation prefix (g b, g o, ...).
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        clearGPending();
        gPending.current = {
          at: Date.now(),
          timer: window.setTimeout(clearGPending, 800),
        };
        return;
      }

      // Second key in g-prefix sequence.
      if (gPending.current !== null) {
        const path = (
          {
            b: PagePath.BLUEPRINTS,
            o: PagePath.OPERATORS,
            r: PagePath.REWARDS,
            e: PagePath.EARNINGS,
            i: PagePath.INSTANCES,
            m: PagePath.BLUEPRINTS_MANAGE,
          } as Record<string, string>
        )[e.key.toLowerCase()];
        if (path !== undefined) {
          e.preventDefault();
          clearGPending();
          navigate(path);
          return;
        }
        clearGPending();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearGPending();
    };
  }, [navigate, onOpenPalette, onOpenHelp]);
}
