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
import type { ComponentProps, ElementType, FC, ReactNode } from 'react';

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

export type TextProps = ComponentProps<'p'> & {
  variant?: 'body1' | 'body2' | 'body3' | 'h5';
  fw?: 'bold' | 'semibold';
};

export const Text: FC<TextProps> = ({
  variant = 'body2',
  fw,
  className = '',
  ...props
}) => {
  const Component = (variant === 'h5' ? 'h2' : 'p') as ElementType;
  const variantClass =
    variant === 'h5'
      ? 'font-display text-xl text-foreground'
      : variant === 'body1'
        ? 'text-base text-foreground'
        : variant === 'body3'
          ? 'text-xs text-muted-foreground'
          : 'text-sm text-foreground';
  const weightClass =
    fw === 'bold' ? 'font-bold' : fw === 'semibold' ? 'font-semibold' : '';

  return (
    <Component
      className={[variantClass, weightClass, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
};

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
    onChange={(event) => onChange?.(event.currentTarget.value)}
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
    className="text-destructive text-xs underline underline-offset-4 hover:text-destructive/80"
    onClick={onClick}
  >
    {children}
  </button>
);
