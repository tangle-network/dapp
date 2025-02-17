interface ReturnData {
    close: () => void;
    open: () => void;
    status: boolean;
    toggle: () => void;
    update: (status: boolean) => void;
}
export declare const useModal: (defaultStatus?: boolean) => ReturnData;
export {};
