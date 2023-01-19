import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const MetaMaskIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg', // Override the default size to `lg` (24px)
    displayName: 'MetaMaskIcon',
    path: (
      <>
        <rect width={24} height={24} rx={8} fill="#fff" />
        <path
          d="M20.648 2.674l-7.495 5.567 1.386-3.284 6.109-2.283z"
          fill="#E2761B"
          stroke="#E2761B"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.345 2.674l7.435 5.62L9.46 4.957 3.345 2.674zM17.951 15.578l-1.996 3.059 4.271 1.175 1.228-4.166-3.503-.068zM2.554 15.646l1.22 4.166 4.271-1.175-1.996-3.059-3.495.068z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.804 10.41l-1.19 1.801 4.241.188-.15-4.557-2.9 2.569zM16.188 10.41l-2.937-2.62-.098 4.61 4.233-.189-1.198-1.8zM8.045 18.637l2.546-1.243-2.2-1.718-.346 2.96zM13.401 17.394l2.554 1.243-.354-2.96-2.2 1.717z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.955 18.637L13.4 17.394l.204 1.664-.023.7 2.373-1.121zM8.045 18.637l2.373 1.122-.015-.7.188-1.665-2.546 1.243z"
          fill="#D7C1B3"
          stroke="#D7C1B3"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.456 14.576l-2.125-.625 1.5-.685.625 1.31zM13.537 14.576l.625-1.31 1.507.685-2.132.625z"
          fill="#233447"
          stroke="#233447"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.045 18.637l.362-3.059-2.358.068 1.996 2.99zM15.593 15.578l.362 3.059 1.996-2.991-2.358-.068zM17.386 12.21l-4.233.19.391 2.176.625-1.31 1.507.685 1.71-1.74zM8.331 13.951l1.507-.685.618 1.31.399-2.177-4.241-.188 1.717 1.74z"
          fill="#CD6116"
          stroke="#CD6116"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.614 12.21l1.778 3.466-.06-1.725-1.718-1.74zM15.676 13.951l-.075 1.725 1.785-3.465-1.71 1.74zM10.855 12.4l-.4 2.176.498 2.569.113-3.382-.211-1.364zM13.152 12.4l-.203 1.355.09 3.39.505-2.569-.392-2.177z"
          fill="#E4751F"
          stroke="#E4751F"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.544 14.576l-.504 2.569.361.248 2.2-1.717.075-1.725-2.132.625zM8.331 13.95l.06 1.726 2.2 1.717.362-.248-.497-2.569-2.125-.625z"
          fill="#F6851B"
          stroke="#F6851B"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.582 19.759l.022-.7-.188-.166h-2.84l-.173.165.015.7-2.373-1.121.829.677 1.68 1.168h2.885l1.687-1.168.829-.677-2.373 1.122z"
          fill="#C0AD9E"
          stroke="#C0AD9E"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.401 17.394l-.361-.249h-2.087l-.362.249-.188 1.664.173-.165h2.84l.188.165-.203-1.664z"
          fill="#161616"
          stroke="#161616"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.964 8.603l.64-3.074-.956-2.855L13.4 8.053l2.787 2.358 3.94 1.152.874-1.017-.377-.27.603-.55-.467-.362.602-.46-.399-.301zM2.396 5.53l.64 3.073-.407.301.603.46-.46.361.603.55-.377.271.866 1.017 3.94-1.152 2.787-2.358-7.246-5.379-.95 2.855z"
          fill="#763D16"
          stroke="#763D16"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.128 11.563l-3.94-1.152 1.198 1.8-1.785 3.465 2.35-.03h3.503l-1.326-4.083zM7.804 10.41l-3.94 1.153-1.31 4.083h3.495l2.343.03-1.778-3.465 1.19-1.8zM13.153 12.4l.248-4.347 1.145-3.096H9.461l1.13 3.096.264 4.346.09 1.371.008 3.375h2.087l.015-3.375.098-1.37z"
          fill="#F6851B"
          stroke="#F6851B"
          strokeWidth={0.088}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  });
};
