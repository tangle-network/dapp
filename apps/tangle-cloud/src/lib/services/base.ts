export interface RegisterArgs {
  blueprintIds: string[];
  registrationArgs: Record<string, unknown>[];
  preferences: unknown[];
  amount: string[];
}

export interface EventHandlers {
  onRegister?: {
    onTxSending?: () => void;
    onTxSuccess?: () => void;
    onTxFailed?: (error: string, args: RegisterArgs) => void;
  };
}

export default interface BaseServices {
  validateRegisterArgs: () => void;
  register: (args: RegisterArgs, eventHandlers: EventHandlers) => Promise<void>;
}
