/**
 * Minimal delegation modal for cloud's operators page.
 * Reuses the EXISTING useDelegateTx hook from tangle-shared-ui — zero new
 * delegation logic. Replaces the deep-link to app.tangle.tools/staking/delegate.
 */
import { useDelegateTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { type FC, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@tangle-network/sandbox-ui/primitives';

interface DelegateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operatorAddress: string;
  operatorLabel?: string;
}

const DelegateModal: FC<DelegateModalProps> = ({
  open,
  onOpenChange,
  operatorAddress,
  operatorLabel,
}) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const contracts = getContractsByChainId(chainId);
  const { execute, error } = useDelegateTx();
  const [amount, setAmount] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token =
    (contracts as any)?.tangleTokenAddress ?? (contracts as any)?.tnt ?? '';

  const handleDelegate = useCallback(async () => {
    if (!amount || !token || !execute) return;
    await execute({
      operator: operatorAddress as `0x${string}`,
      token,
      amount: parseUnits(amount, 18),
    });
    onOpenChange(false);
  }, [amount, execute, onOpenChange, operatorAddress, token]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delegate to {operatorLabel ?? `${operatorAddress.slice(0, 8)}…`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Amount (TNT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          <button
            onClick={handleDelegate}
            disabled={!isConnected || !amount}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Delegate
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DelegateModal;
