import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { chromeHeight, typeRole } from '../../styles/chrome';

type Density = 'compact' | 'default' | 'hero';

type Props = {
  title: string;
  subtitle?: ReactNode;
  /** Right-aligned primary action(s). Keep it to one button on most pages. */
  action?: ReactNode;
  /** Optional small breadcrumb / context above the title. */
  eyebrow?: ReactNode;
  density?: Density;
  className?: string;
};

const DENSITY_CLASS: Record<Density, string> = {
  compact: chromeHeight.headerCompact,
  default: chromeHeight.headerDefault,
  hero: chromeHeight.headerHero,
};

/**
 * The header pattern for every cloud-app page. Composes a single H1, an
 * optional subtitle, an optional eyebrow, and a slot for right-aligned
 * actions. Three density modes — `compact` (60px) for tool-heavy pages
 * where the page title fights for space, `default` (80px) for most pages,
 * `hero` (120px) for the rare landing-y surface that earns the room.
 *
 * Replaces the bespoke `cloud-hero-card` + `cloud-compact-header` chrome that
 * each cloud-app page used to invent for itself. No card wrapping, no gradient
 * backdrop, no shadow ramp — header is typography on the page background.
 */
const PageHeader: FC<Props> = ({
  title,
  subtitle,
  action,
  eyebrow,
  density = 'default',
  className,
}) => {
  return (
    <header
      className={twMerge(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        DENSITY_CLASS[density],
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow !== undefined && (
          <div className={typeRole.label}>{eyebrow}</div>
        )}
        <h1 className={typeRole.display}>{title}</h1>
        {subtitle !== undefined && (
          <p className="max-w-2xl text-base leading-relaxed text-mono-100 dark:text-mono-60">
            {subtitle}
          </p>
        )}
      </div>
      {action !== undefined && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:gap-3">
          {action}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
