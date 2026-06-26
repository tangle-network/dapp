import { FC } from 'react';
import { formatUnits } from 'viem';
import type { NoteData } from '../../types/shielded';
import { TOKEN_DECIMALS } from '../../constants/payments';

const shortenHex = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

type Props = {
  note: NoteData;
  onDelete?: () => void;
  compact?: boolean;
};

const NoteCard: FC<Props> = ({ note, onDelete, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-2 text-sm border rounded border-mono-60 dark:border-mono-170">
        <span className="font-mono text-mono-200 dark:text-mono-0">
          {formatUnits(note.amount, TOKEN_DECIMALS)} {note.tokenSymbol}
        </span>

        <span className="text-xs text-mono-120 dark:text-mono-100">
          #{note.index ?? 'pending'}
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 border rounded-lg border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-mono-200 dark:text-mono-0">
          {formatUnits(note.amount, TOKEN_DECIMALS)} {note.tokenSymbol}
        </span>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-red-70 dark:text-red-50 hover:underline"
          >
            Delete
          </button>
        )}
      </div>

      <div className="space-y-1 text-xs text-mono-120 dark:text-mono-100">
        <div className="flex justify-between">
          <span>Pool</span>
          <span className="font-mono">{shortenHex(note.targetAnchor, 6)}</span>
        </div>

        <div className="flex justify-between">
          <span>Chain</span>
          <span>{note.targetChainId}</span>
        </div>

        <div className="flex justify-between">
          <span>Index</span>
          <span>{note.index ?? 'Unconfirmed'}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
