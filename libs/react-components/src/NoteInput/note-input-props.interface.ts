export interface NoteInputProps {
  note: string;
  setNote: (nextNote: string) => void;
  error?: string;
  noteAction: () => void;
  isRemoveNote?: boolean;
}
