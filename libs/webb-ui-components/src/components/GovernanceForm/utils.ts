export const MAX_NUM_OF_CHAINS = 8;

export function getChainIconClassNameByIdx(idx: number) {
  const baseClassName = 'absolute';
  let positionClassName = '';
  switch (idx % MAX_NUM_OF_CHAINS) {
    case 0:
      positionClassName = 'top-1/2 translate-y-[-50%] left-[105.5px]';
      break;
    case 1:
      positionClassName =
        'rotate-45 top-[40px] translate-y-[-50%] left-[131.5px]';
      break;
    case 2:
      positionClassName = 'top-[2px] translate-x-[50%] right-1/2';
      break;
    case 3:
      positionClassName =
        '-rotate-45 top-[40px] translate-y-[-50%] right-[132.5px]';
      break;
    case 4:
      positionClassName = 'top-1/2 translate-y-[-50%] right-[105.5px]';
      break;
    case 5:
      positionClassName =
        '-rotate-45 bottom-[16.75px] translate-y-[-50%] right-[132.2575px]';
      break;
    case 6:
      positionClassName = 'bottom-[2px] translate-x-[50%] right-1/2';
      break;
    case 7:
      positionClassName =
        'rotate-45 bottom-[17px] translate-y-[-50%] left-[131.5px]';
      break;
    default:
      break;
  }

  return `${baseClassName} ${positionClassName}`;
}
