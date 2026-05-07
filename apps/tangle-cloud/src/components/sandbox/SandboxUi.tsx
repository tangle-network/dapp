import {
  Badge,
  Button as SandboxButton,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input as SandboxInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@tangle-network/sandbox-ui/primitives';
import type { ChangeEvent, ComponentProps, FC, ReactNode } from 'react';

// Re-export the canonical tangle-cloud Text from the dedicated module so we
// preserve the existing import surface (`import { Text } from '...sandbox/SandboxUi'`)
// while routing through a single Text implementation that consumes
// @tangle-network/brand 0.3 tokens.
export { Text } from '../Text';
export type { TextProps, TextVariant } from '../Text';

export {
  Badge,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
};

const sizeToClassName = (size?: string) =>
  size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-9 w-9' : 'h-12 w-12';

export const Avatar: FC<{
  size?: 'sm' | 'md' | 'lg' | string;
  src?: string;
  alt?: string;
  value?: string;
  sourceVariant?: string;
  theme?: string;
  className?: string;
}> = ({ size = 'md', src, alt, value, className = '' }) => {
  const label = value?.startsWith('0x') ? value.slice(2, 4).toUpperCase() : '?';

  return src ? (
    <img
      src={src}
      alt={alt ?? ''}
      className={[
        sizeToClassName(size),
        'rounded-full border border-border object-cover',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  ) : (
    <div
      className={[
        sizeToClassName(size),
        'flex shrink-0 items-center justify-center rounded-full border border-border bg-gradient-to-br from-primary/25 to-accent/25 font-mono text-xs text-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </div>
  );
};

export const CircularProgress: FC<{
  progress: number;
  size?: string;
  tooltip?: string;
}> = ({ progress, tooltip }) => (
  <span
    title={tooltip}
    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground"
  >
    {Math.round(progress * 100)}%
  </span>
);

export type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?:
    | ComponentProps<typeof SandboxButton>['variant']
    | 'utility'
    | 'primary';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
  isJustIcon?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loadingText?: string;
  disabledTooltip?: string;
};

export const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  isJustIcon,
  isFullWidth,
  leftIcon,
  rightIcon,
  loadingText: _loadingText,
  disabledTooltip: _disabledTooltip,
  disabled,
  className = '',
  children,
  ...props
}) => (
  <SandboxButton
    variant={
      variant === 'utility'
        ? 'outline'
        : variant === 'primary'
          ? 'default'
          : variant
    }
    size={isJustIcon ? 'icon' : size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    className={[isFullWidth ? 'w-full' : '', className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {leftIcon}
    {children}
    {rightIcon}
  </SandboxButton>
);

export type InputProps = Omit<
  ComponentProps<typeof SandboxInput>,
  'onChange'
> & {
  isControlled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  inputClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (value: string) => void;
};

export const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  isInvalid,
  errorMessage,
  inputClassName,
  leftIcon,
  rightIcon,
  className = '',
  onChange,
  ...props
}) => (
  <div className={['relative', className].filter(Boolean).join(' ')}>
    <SandboxInput
      {...props}
      className={[
        leftIcon ? 'pl-10' : '',
        rightIcon ? 'pr-20' : '',
        inputClassName,
        isInvalid ? 'border-destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange?.(event.currentTarget.value)
      }
    />
    {leftIcon && (
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
        {leftIcon}
      </div>
    )}
    {rightIcon && (
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {rightIcon}
      </div>
    )}
    {errorMessage && (
      <p className="mt-1 text-destructive text-xs">{errorMessage}</p>
    )}
  </div>
);

export const Modal = Dialog;

export const ModalContent: FC<
  ComponentProps<typeof DialogContent> & {
    size?: string;
    title?: string;
    description?: string;
  }
> = ({ size: _size, title: _title, description: _description, ...props }) => (
  <DialogContent {...props} />
);

export const ModalHeader: FC<
  ComponentProps<'div'> & {
    onClose?: () => void;
  }
> = ({ onClose, children, className = '', ...props }) => (
  <DialogHeader
    className={['flex flex-row items-center justify-between gap-4', className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    <DialogTitle>{children}</DialogTitle>
    {onClose && (
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onClose}
        aria-label="Close"
      >
        x
      </Button>
    )}
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

export const ModalFooter = DialogFooter;

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
      isLoading={isProcessing}
      onClick={() => void onConfirm()}
    >
      {confirmButtonText}
    </Button>
  </DialogFooter>
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

export const NativeCheckbox: FC<{
  checked: boolean;
  onChange: () => void;
  className?: string;
}> = ({ checked, onChange, className = '' }) => (
  <input
    type="checkbox"
    className={['h-4 w-4 rounded border-border accent-primary', className]
      .filter(Boolean)
      .join(' ')}
    checked={checked}
    onChange={onChange}
  />
);

export const Alert: FC<{
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}> = ({ type = 'info', title, description, className = '', children }) => {
  const tone =
    type === 'error'
      ? 'border-destructive/40 bg-destructive/10 text-destructive'
      : type === 'warning'
        ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
        : type === 'success'
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-border bg-muted/40 text-muted-foreground';

  return (
    <div
      className={['rounded-xl border p-4 text-sm', tone, className]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <div className="mb-1 font-semibold">{title}</div>}
      {description && <div>{description}</div>}
      {children}
    </div>
  );
};
