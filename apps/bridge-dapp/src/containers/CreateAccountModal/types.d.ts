export interface CreateAccountModalProps {
  /**
   * Boolean value to control the component
   */
  isOpen: boolean;

  /**
   * Callback to control the component
   */
  onOpenChange: (open: boolean) => void;
}
