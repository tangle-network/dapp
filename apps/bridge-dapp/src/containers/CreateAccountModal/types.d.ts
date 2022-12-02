export interface CreateAccountModalProps {
  /**
   * Boolean value to control the component
   */
  isOpen: boolean;

  /**
   * Callback to control the component
   */
  onOpenChange: (open: boolean) => void;

  /**
   * The state indicating if the account is being created
   */
  isSuccess?: boolean;

  /**
   * Callback to change the state indicating if the account is being created
   * @param isSuccess Next value of the isSuccess state
   */
  onIsSuccessChange?: (isSuccess: boolean) => void;
}
