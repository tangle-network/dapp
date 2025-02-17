declare const WalletButton: import('../../../../../node_modules/react').ForwardRefExoticComponent<Omit<import('../../../../../node_modules/react').DetailedHTMLProps<import('../../../../../node_modules/react').ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    wallet: import('../../../../dapp-config/src/index.ts').WalletConfig;
    address: string;
    accountName?: string;
    addressClassname?: string;
} & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
export default WalletButton;
