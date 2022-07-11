import { SnackbarContent as SnackbarContentBase, SnackbarProvider as SnackbarProviderBase } from 'notistack';

declare module 'notistack' {
  export interface SnackbarProvider extends SnackbarProviderBase {
    render(): ReactNode;
  }
}
