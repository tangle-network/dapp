import { FC, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import {
  Alert,
  Button,
  Input,
  Chip,
  Text,
} from '../../components/sandbox/SandboxUi';
import AmountInput from '../../components/payments/AmountInput';
import NoteCard from '../../components/payments/NoteCard';
import { useShieldedContext } from '../../app/ShieldedProvider';

const WithdrawContainer: FC = () => {
  const { notes } = useShieldedContext();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const confirmedNotes = useMemo(
    () => notes.filter((n) => n.index !== undefined),
    [notes],
  );

  const isValidRecipient = recipient === '' || isAddress(recipient);

  return (
    <div className="space-y-4">
      <div>
        <Text variant="h5" fw="semibold">
          Withdraw from Shielded Pool
        </Text>

        <Text variant="body2" className="mt-1 text-muted-foreground">
          Withdraw shielded tokens to a public address. Notes are selected
          automatically (FIFO). Change is returned as a new note.
        </Text>
      </div>

      {confirmedNotes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Text variant="body2" fw="semibold">
              Available Notes
            </Text>

            <Chip color="blue">{confirmedNotes.length}</Chip>
          </div>

          <div className="flex flex-wrap gap-1">
            {confirmedNotes.slice(0, 5).map((note) => (
              <NoteCard
                key={`${note.targetAnchor}:${note.blinding}`}
                note={note}
                compact
              />
            ))}

            {confirmedNotes.length > 5 && (
              <Text
                variant="body3"
                className="self-center text-muted-foreground"
              >
                +{confirmedNotes.length - 5} more
              </Text>
            )}
          </div>
        </div>
      )}

      <AmountInput
        value={amount}
        onChange={setAmount}
        balance={confirmedNotes.reduce((sum, n) => sum + n.amount, 0n)}
        symbol="SHIELDED"
        label="Withdraw Amount"
        disabled
      />

      <div className="space-y-1">
        <Text variant="body2" fw="semibold" className="text-muted-foreground">
          Recipient Address
        </Text>

        <Input
          id="withdraw-recipient"
          value={recipient}
          onChange={setRecipient}
          isControlled
          isInvalid={!isValidRecipient}
          errorMessage={
            !isValidRecipient ? 'Invalid Ethereum address' : undefined
          }
          inputClassName="font-mono"
        />
      </div>

      <Alert
        type="info"
        description="Withdrawals require @tangle-network/shielded-sdk for ZK proof generation and UTXO selection."
      />

      <Button isFullWidth isDisabled disabledTooltip="SDK integration pending">
        Withdraw
      </Button>
    </div>
  );
};

export default WithdrawContainer;
