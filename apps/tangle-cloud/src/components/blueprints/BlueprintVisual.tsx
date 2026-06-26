import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { useState, type CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  formatBlueprintName,
  getGithubPreviewUrl,
  getUsableMetadataImageUrl,
} from './blueprintVisualUtils';

type Props = {
  blueprint: Blueprint;
  category: string;
  className?: string;
  compact?: boolean;
};

export const BlueprintVisual = ({
  blueprint,
  category,
  className = '',
  compact = false,
}: Props) => {
  const imageUrl =
    getUsableMetadataImageUrl(blueprint.imgUrl) ??
    getGithubPreviewUrl(blueprint.githubUrl);
  const [imageErrorUrl, setImageErrorUrl] = useState<string | null>(null);
  const displayName = formatBlueprintName(blueprint.name);
  const style = getBlueprintVisualStyle(`${displayName}:${category}`);
  const hasImageError = imageErrorUrl === imageUrl;
  const resolvedImageUrl = imageUrl && !hasImageError ? imageUrl : null;

  // Check for a branded SVG icon for known first-party blueprints
  const brandedIcon = getBrandedIcon(blueprint);

  return (
    <div
      className={twMerge(
        'relative isolate overflow-hidden rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 shadow-sm',
        compact ? 'h-24' : 'h-44',
        className,
      )}
      style={style}
    >
      {resolvedImageUrl ? (
        <>
          <img
            src={resolvedImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            loading="lazy"
            onError={() => setImageErrorUrl(imageUrl)}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/25 to-black/60" />
        </>
      ) : brandedIcon ? (
        <img
          src={brandedIcon}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <GeneratedBlueprintDiagram name={displayName} category={category} />
      )}
    </div>
  );
};

const BRANDED_ICON_MAP: Record<string, string> = {
  'ai-agent-sandbox': 'ai-agent-sandbox',
  'ai-trading': 'ai-trading',
  trading: 'ai-trading',
  'llm-inference': 'llm-inference',
  'modal-inference': 'modal-inference',
  'image-gen': 'image-gen',
  'image generation': 'image-gen',
  training: 'training',
  'vector-store': 'vector-store',
  'vector store': 'vector-store',
  'distributed-inference': 'distributed-inference',
  'voice-inference': 'voice-inference',
  'avatar-inference': 'avatar-inference',
  'embedding-inference': 'embedding-inference',
  'video-gen': 'video-gen',
  'video generation': 'video-gen',
  bazaar: 'bazaar',
  'inference bazaar': 'bazaar',
  surplus: 'bazaar',
};

const getBrandedIcon = (blueprint: Blueprint): string | null => {
  const normalized = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '-');
  const name = normalized(blueprint.name ?? '');
  const uri = normalized(blueprint.blueprintUi?.requestedSlug ?? '');
  const githubUrl = normalized(blueprint.githubUrl ?? '');

  for (const [key, slug] of Object.entries(BRANDED_ICON_MAP)) {
    const nk = normalized(key);
    if (name.includes(nk) || uri.includes(nk) || githubUrl.includes(nk)) {
      return `/blueprints/${slug}.svg`;
    }
  }
  return null;
};

const GeneratedBlueprintDiagram = ({
  name,
  category,
}: {
  name: string;
  category: string;
}) => {
  const nodes = getDiagramNodes(`${name}:${category}`);
  const visualKind = getVisualKind(category);

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,var(--blueprint-hot),transparent_28%),radial-gradient(circle_at_78%_20%,var(--blueprint-cool),transparent_30%),linear-gradient(135deg,var(--blueprint-bg-a),var(--blueprint-bg-b))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]" />
      <svg
        viewBox="0 0 480 220"
        className="absolute inset-0 h-full w-full opacity-90"
        aria-hidden
      >
        <CategoryDiagram kind={visualKind} />
        <path
          d="M72 146 C150 42 230 192 310 82 S420 84 438 152"
          fill="none"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth="2"
        />
        <path
          d="M68 92 C150 142 220 48 310 128 S404 178 448 88"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        {nodes.map((node, index) => (
          <g key={`${node.x}-${node.y}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={index === 1 ? 21 : 15}
              fill="rgba(255,255,255,0.14)"
              stroke="rgba(255,255,255,0.4)"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={index === 1 ? 7 : 5}
              fill="white"
              opacity="0.9"
            />
          </g>
        ))}
      </svg>
    </>
  );
};

const getDiagramNodes = (seed: string) => {
  const hue = hashSeed(seed);
  const offset = hue % 42;

  return [
    { x: 86 + (offset % 20), y: 132 - (offset % 18) },
    { x: 220 + (offset % 34), y: 82 + (offset % 30) },
    { x: 344 - (offset % 26), y: 138 - (offset % 22) },
    { x: 422 - (offset % 16), y: 96 + (offset % 28) },
  ];
};

const CategoryDiagram = ({ kind }: { kind: VisualKind }) => {
  if (kind === 'training') {
    return (
      <g opacity="0.9">
        {[0, 1, 2, 3, 4].map((index) => (
          <rect
            key={index}
            x={62 + index * 54}
            y={150 - index * 17}
            width="34"
            height={38 + index * 17}
            rx="8"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.22)"
          />
        ))}
        <path
          d="M82 144 L136 126 L190 102 L244 84 L298 62"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="3"
        />
      </g>
    );
  }

  if (kind === 'inference') {
    return (
      <g opacity="0.9">
        {[88, 198, 308].map((x, index) => (
          <rect
            key={x}
            x={x}
            y={70 + index * 18}
            width="74"
            height="46"
            rx="14"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.24)"
          />
        ))}
        <path
          d="M162 94 H198 M272 116 H308"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (kind === 'data') {
    return (
      <g opacity="0.92">
        {Array.from({ length: 22 }).map((_, index) => {
          const x = 70 + ((index * 73) % 330);
          const y = 46 + ((index * 41) % 126);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index % 5 === 0 ? 5 : 3}
              fill="rgba(255,255,255,0.54)"
            />
          );
        })}
        <ellipse
          cx="240"
          cy="110"
          rx="146"
          ry="54"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2"
        />
      </g>
    );
  }

  if (kind === 'agent') {
    return (
      <g opacity="0.92">
        <rect
          x="76"
          y="58"
          width="328"
          height="104"
          rx="24"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.22)"
        />
        <path
          d="M130 108 H206 M274 108 H350 M240 74 V142"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="240" cy="108" r="24" fill="rgba(255,255,255,0.16)" />
      </g>
    );
  }

  if (kind === 'trading') {
    return (
      <g opacity="0.92">
        {[78, 126, 174, 222, 270, 318, 366].map((x, index) => (
          <g key={x}>
            <line
              x1={x}
              x2={x}
              y1={52 + ((index * 19) % 54)}
              y2={158 - ((index * 13) % 44)}
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="3"
            />
            <rect
              x={x - 10}
              y={86 + ((index * 23) % 42)}
              width="20"
              height="42"
              rx="5"
              fill={
                index % 2 === 0
                  ? 'rgba(16,185,129,0.5)'
                  : 'rgba(244,63,94,0.45)'
              }
            />
          </g>
        ))}
      </g>
    );
  }

  return (
    <g opacity="0.9">
      <circle
        cx="240"
        cy="110"
        r="66"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.24)"
      />
      <path
        d="M174 110 H306 M240 44 V176 M194 64 L286 156 M286 64 L194 156"
        stroke="rgba(255,255,255,0.32)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
};

const getBlueprintVisualStyle = (seed: string) => {
  const hue = hashSeed(seed);
  return {
    '--blueprint-hot': `hsl(${hue} 84% 62% / 0.5)`,
    '--blueprint-cool': `hsl(${(hue + 74) % 360} 86% 56% / 0.42)`,
    '--blueprint-bg-a': `hsl(${(hue + 230) % 360} 44% 12%)`,
    '--blueprint-bg-b': `hsl(${(hue + 285) % 360} 50% 7%)`,
  } as CSSProperties;
};

type VisualKind =
  | 'agent'
  | 'data'
  | 'generic'
  | 'inference'
  | 'trading'
  | 'training';

const getVisualKind = (category: string): VisualKind => {
  const normalized = category.toLowerCase();
  if (normalized.includes('training')) return 'training';
  if (normalized.includes('inference')) return 'inference';
  if (
    normalized.includes('data') ||
    normalized.includes('vector') ||
    normalized.includes('infrastructure')
  ) {
    return 'data';
  }
  if (normalized.includes('agent')) return 'agent';
  if (normalized.includes('trading')) return 'trading';
  return 'generic';
};

const hashSeed = (seed: string) =>
  Array.from(seed).reduce((hash, char) => {
    return (hash * 33 + char.charCodeAt(0)) % 360;
  }, 17);
