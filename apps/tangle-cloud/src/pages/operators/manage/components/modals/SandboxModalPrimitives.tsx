import {
  Button as SandboxButton,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input as SandboxInput,
  Badge,
  Textarea,
} from '@tangle-network/sandbox-ui/primitives';
import type { ChangeEvent, ComponentProps, FC, ReactNode } from 'react';

// Re-export the canonical Text so this module's existing import surface keeps
// working while routing through the single tangle-cloud Text component.
export { Text } from '../../../../../components/Text';
export type { TextProps, TextVariant } from '../../../../../components/Text';

export const Modal = Dialog;

export const ModalContent: FC<
  ComponentProps<typeof DialogContent> & { size?: string }
> = ({ size: _size, ...props }) => <DialogContent {...props} />;

export const ModalHeader: FC<ComponentProps<'div'>> = ({
  children,
  ...props
}) => (
  <DialogHeader {...props}>
    <DialogTitle>{children}</DialogTitle>
  </DialogHeader>
);

export const ModalBody: FC<ComponentProps<'div'>> = ({
  className = '',
  ...props
}) => (
  <div
    className={['space-y-4', className].filter(Boolean).join(' ')}
    {...props}
  />
);

export type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isProcessing?: boolean;
  isLoading?: boolean;
};

export const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  isProcessing,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    loading={isLoading || isProcessing}
    {...props}
  />
);

export const ModalFooterActions: FC<{
  hasCloseButton?: boolean;
  isConfirmDisabled?: boolean;
  isProcessing?: boolean;
  confirmButtonText: string;
  onConfirm: () => void | Promise<void>;
}> = ({
  hasCloseButton,
  isConfirmDisabled,
  isProcessing,
  confirmButtonText,
  onConfirm,
}) => (
  <DialogFooter>
    {hasCloseButton && (
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
    )}
    <Button
      isDisabled={isConfirmDisabled}
      isProcessing={isProcessing}
      onClick={() => void onConfirm()}
    >
      {confirmButtonText}
    </Button>
  </DialogFooter>
);

export const SlashTextarea: FC<ComponentProps<typeof Textarea>> = ({
  className = '',
  ...props
}) => (
  <Textarea
    className={['min-h-28 resize-none', className].filter(Boolean).join(' ')}
    {...props}
  />
);

export type InputProps = Omit<
  ComponentProps<typeof SandboxInput>,
  'onChange'
> & {
  isControlled?: boolean;
  onChange?: (value: string) => void;
};

export const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  onChange,
  ...props
}) => (
  <SandboxInput
    {...props}
    onChange={(event: ChangeEvent<HTMLInputElement>) =>
      onChange?.(event.currentTarget.value)
    }
  />
);

export const Chip: FC<{
  color?: string;
  className?: string;
  children: ReactNode;
}> = ({ color, className, children }) => {
  const variant =
    color === 'green' ? 'success' : color === 'red' ? 'destructive' : 'outline';

  return (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  );
};

export const CopyButton: FC<{ children: ReactNode; onClick: () => void }> = ({
  children,
  onClick,
}) => (
  <button
    type="button"
    className="text-red-500 dark:text-red-400 text-xs underline underline-offset-4 hover:text-red-500 dark:text-red-400/80"
    onClick={onClick}
  >
    {children}
  </button>
);
