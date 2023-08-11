import cx from 'classnames';
import { forwardRef } from 'react';
import { ProposalBadgeProps, ProposalVariant } from './types';

const classes: {
  [key in ProposalVariant]: {
    bgColor: string;
    iconColor: string;
  };
} = {
  AnchorCreate: {
    bgColor: cx('fill-purple-10 dark:fill-purple-120'),
    iconColor: cx('fill-purple-90 dark:fill-purple-30'),
  },
  AnchorUpdate: {
    bgColor: cx('fill-blue-10 dark:fill-blue-120'),
    iconColor: cx('fill-blue-90 dark:fill-blue-30'),
  },
  Evm: {
    bgColor: cx('fill-purple-10 dark:fill-purple-120'),
    iconColor: cx('fill-purple-90 dark:fill-purple-30'),
  },
  FeeRecipientUpdate: {
    bgColor: cx('fill-green-10 dark:fill-green-120'),
    iconColor: cx('fill-green-90 dark:fill-green-30'),
  },
  MaxDepositLimitUpdate: {
    bgColor: cx('fill-yellow-10 dark:fill-yellow-120'),
    iconColor: cx('fill-yellow-90 dark:fill-yellow-30'),
  },
  MinWithdrawalLimitUpdate: {
    bgColor: cx('fill-yellow-10 dark:fill-yellow-120'),
    iconColor: cx('fill-yellow-90 dark:fill-yellow-30'),
  },
  Refresh: {
    bgColor: cx('fill-green-10 dark:fill-green-120'),
    iconColor: cx('fill-green-90 dark:fill-green-30'),
  },
  RescueTokens: {
    bgColor: cx('fill-red-10 dark:fill-red-120'),
    iconColor: cx('fill-red-90 dark:fill-red-30'),
  },
  ResourceIdUpdate: {
    bgColor: cx('fill-blue-10 dark:fill-blue-120'),
    iconColor: cx('fill-blue-90 dark:fill-blue-30'),
  },
  SetTreasuryHandler: {
    bgColor: cx('fill-purple-10 dark:fill-purple-120'),
    iconColor: cx('fill-purple-90 dark:fill-purple-30'),
  },
  SetVerifier: {
    bgColor: cx('fill-purple-10 dark:fill-purple-120'),
    iconColor: cx('fill-purple-90 dark:fill-purple-30'),
  },
  TokenAdd: {
    bgColor: cx('fill-yellow-10 dark:fill-yellow-120'),
    iconColor: cx('fill-yellow-90 dark:fill-yellow-30'),
  },
  TokenRemove: {
    bgColor: cx('fill-red-10 dark:fill-red-120'),
    iconColor: cx('fill-red-90 dark:fill-red-30'),
  },
  WrappingFeeUpdate: {
    bgColor: cx('fill-green-10 dark:fill-green-120'),
    iconColor: cx('fill-green-90 dark:fill-green-30'),
  },
};

const ProposalBadge = forwardRef<SVGSVGElement, ProposalBadgeProps>(
  ({ variant = 'Refresh', ...props }, ref) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={ref}
        {...props}
      >
        <rect
          width="24"
          height="24"
          rx="12"
          className={classes[variant].bgColor}
        />

        {getIconPathByVariant(variant, classes[variant].iconColor)}
      </svg>
    );
  }
);

export default ProposalBadge;

const getIconPathByVariant = (variant: ProposalVariant, className: string) => {
  switch (variant) {
    case 'AnchorUpdate':
      return (
        <path
          d="M10.667 14.1138L16.7952 7.9856L17.738 8.9284L10.667 15.9994L6.42432 11.7568L7.36712 10.814L10.667 14.1138Z"
          className={className}
        />
      );
    case 'FeeRecipientUpdate':
      return (
        <path
          d="M13.3332 13.5014V14.8943C12.9161 14.7469 12.4674 14.6667 11.9998 14.6667C9.7907 14.6667 7.99984 16.4576 7.99984 18.6667H6.6665C6.6665 15.7212 9.05432 13.3334 11.9998 13.3334C12.4602 13.3334 12.907 13.3917 13.3332 13.5014ZM11.9998 12.6667C9.78984 12.6667 7.99984 10.8767 7.99984 8.66675C7.99984 6.45675 9.78984 4.66675 11.9998 4.66675C14.2098 4.66675 15.9998 6.45675 15.9998 8.66675C15.9998 10.8767 14.2098 12.6667 11.9998 12.6667ZM11.9998 11.3334C13.4732 11.3334 14.6665 10.1401 14.6665 8.66675C14.6665 7.19341 13.4732 6.00008 11.9998 6.00008C10.5265 6.00008 9.33317 7.19341 9.33317 8.66675C9.33317 10.1401 10.5265 11.3334 11.9998 11.3334ZM16.9454 15.3334H19.336V16.6667H16.9454L18.1644 17.8857L17.2216 18.8285L14.3932 16.0001L17.2216 13.1717L18.1644 14.1145L16.9454 15.3334Z"
          className={className}
        />
      );
    case 'MaxDepositLimitUpdate':
      return (
        <path
          d="M11.3335 11.3333V8.66659H12.6668V11.3333H15.3335V12.6666H12.6668V15.3333H11.3335V12.6666H8.66683V11.3333H11.3335ZM12.0002 18.6666C8.31826 18.6666 5.3335 15.6818 5.3335 11.9999C5.3335 8.31802 8.31826 5.33325 12.0002 5.33325C15.682 5.33325 18.6668 8.31802 18.6668 11.9999C18.6668 15.6818 15.682 18.6666 12.0002 18.6666ZM12.0002 17.3333C14.9457 17.3333 17.3335 14.9455 17.3335 11.9999C17.3335 9.0544 14.9457 6.66659 12.0002 6.66659C9.05464 6.66659 6.66683 9.0544 6.66683 11.9999C6.66683 14.9455 9.05464 17.3333 12.0002 17.3333Z"
          className={className}
        />
      );
    case 'MinWithdrawalLimitUpdate':
      return (
        <path
          d="M12.0002 18.6666C8.31826 18.6666 5.3335 15.6818 5.3335 11.9999C5.3335 8.31802 8.31826 5.33325 12.0002 5.33325C15.682 5.33325 18.6668 8.31802 18.6668 11.9999C18.6668 15.6818 15.682 18.6666 12.0002 18.6666ZM12.0002 17.3333C14.9457 17.3333 17.3335 14.9455 17.3335 11.9999C17.3335 9.0544 14.9457 6.66659 12.0002 6.66659C9.05464 6.66659 6.66683 9.0544 6.66683 11.9999C6.66683 14.9455 9.05464 17.3333 12.0002 17.3333ZM8.66683 11.3333H15.3335V12.6666H8.66683V11.3333Z"
          className={className}
        />
      );
    case 'Refresh':
      return (
        <path
          d="M7.64188 6.95524C8.81054 5.94475 10.334 5.3335 12.0002 5.3335C15.682 5.3335 18.6668 8.31826 18.6668 12.0002C18.6668 13.4242 18.2203 14.744 17.4596 15.8272L15.3335 12.0002H17.3335C17.3335 9.05464 14.9457 6.66683 12.0002 6.66683C10.5667 6.66683 9.26534 7.23234 8.30698 8.15244L7.64188 6.95524ZM16.3584 17.0451C15.1898 18.0556 13.6664 18.6668 12.0002 18.6668C8.31826 18.6668 5.3335 15.682 5.3335 12.0002C5.3335 10.5761 5.78002 9.25627 6.5407 8.17312L8.66683 12.0002H6.66683C6.66683 14.9457 9.05464 17.3335 12.0002 17.3335C13.4336 17.3335 14.735 16.768 15.6934 15.8479L16.3584 17.0451Z"
          className={className}
        />
      );
    case 'RescueTokens':
      return (
        <path
          d="M12.0002 5.3335C15.682 5.3335 18.6668 8.31826 18.6668 12.0002C18.6668 15.682 15.682 18.6668 12.0002 18.6668C8.31826 18.6668 5.3335 15.682 5.3335 12.0002C5.3335 8.31826 8.31826 5.3335 12.0002 5.3335ZM12.0002 15.3335C11.5702 15.3335 11.1592 15.2521 10.7818 15.1038L9.29086 16.595C10.0849 17.0642 11.0111 17.3335 12.0002 17.3335C12.9892 17.3335 13.9154 17.0642 14.7095 16.595L13.2185 15.1038C12.8411 15.2521 12.4302 15.3335 12.0002 15.3335ZM6.66683 12.0002C6.66683 12.9892 6.93607 13.9154 7.40526 14.7095L8.8965 13.2185C8.74825 12.8411 8.66683 12.4302 8.66683 12.0002C8.66683 11.5702 8.74825 11.1592 8.8965 10.7818L7.40526 9.29086C6.93607 10.0849 6.66683 11.0111 6.66683 12.0002ZM16.595 9.29086L15.1038 10.7818C15.2521 11.1592 15.3335 11.5702 15.3335 12.0002C15.3335 12.4302 15.2521 12.8411 15.1038 13.2185L16.595 14.7095C17.0642 13.9154 17.3335 12.9892 17.3335 12.0002C17.3335 11.0111 17.0642 10.0849 16.595 9.29086ZM12.0002 10.0002C10.8956 10.0002 10.0002 10.8956 10.0002 12.0002C10.0002 13.1048 10.8956 14.0002 12.0002 14.0002C13.1048 14.0002 14.0002 13.1048 14.0002 12.0002C14.0002 10.8956 13.1048 10.0002 12.0002 10.0002ZM12.0002 6.66683C11.0111 6.66683 10.0849 6.93607 9.29086 7.40526L10.7818 8.8965C11.1592 8.74825 11.5702 8.66683 12.0002 8.66683C12.4302 8.66683 12.8411 8.74825 13.2185 8.8965L14.7095 7.40526C13.9154 6.93607 12.9892 6.66683 12.0002 6.66683Z"
          className={className}
        />
      );
    case 'ResourceIdUpdate':
      return (
        <path
          d="M8.73672 9.85994C8.96786 10.709 9.74435 11.3333 10.6667 11.3333H13.3333C14.9802 11.3333 16.3481 12.5277 16.6183 14.0974C17.4202 14.3578 18 15.1112 18 16C18 17.1046 17.1046 18 16 18C14.8954 18 14 17.1046 14 16C14 15.1556 14.5233 14.4334 15.2633 14.1401C15.0321 13.291 14.2557 12.6667 13.3333 12.6667H10.6667C9.91626 12.6667 9.22377 12.4187 8.66667 12.0003V14.1138C9.44346 14.3883 10 15.1292 10 16C10 17.1046 9.10457 18 8 18C6.89543 18 6 17.1046 6 16C6 15.1292 6.55654 14.3883 7.33333 14.1138V9.88619C6.55654 9.61164 6 8.87081 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8C10 8.84441 9.47671 9.56659 8.73672 9.85994ZM8 8.66667C8.36819 8.66667 8.66667 8.36819 8.66667 8C8.66667 7.63181 8.36819 7.33333 8 7.33333C7.63181 7.33333 7.33333 7.63181 7.33333 8C7.33333 8.36819 7.63181 8.66667 8 8.66667ZM8 16.6667C8.36819 16.6667 8.66667 16.3682 8.66667 16C8.66667 15.6318 8.36819 15.3333 8 15.3333C7.63181 15.3333 7.33333 15.6318 7.33333 16C7.33333 16.3682 7.63181 16.6667 8 16.6667ZM16 16.6667C16.3682 16.6667 16.6667 16.3682 16.6667 16C16.6667 15.6318 16.3682 15.3333 16 15.3333C15.6318 15.3333 15.3333 15.6318 15.3333 16C15.3333 16.3682 15.6318 16.6667 16 16.6667Z"
          className={className}
        />
      );
    case 'SetTreasuryHandler':
      return (
        <path
          d="M5.3335 17.3335H18.6668V18.6668H5.3335V17.3335ZM6.66683 12.0002H8.00016V16.6668H6.66683V12.0002ZM10.0002 12.0002H11.3335V16.6668H10.0002V12.0002ZM12.6668 12.0002H14.0002V16.6668H12.6668V12.0002ZM16.0002 12.0002H17.3335V16.6668H16.0002V12.0002ZM5.3335 8.66683L12.0002 5.3335L18.6668 8.66683V11.3335H5.3335V8.66683ZM6.66683 9.49088V10.0002H17.3335V9.49088L12.0002 6.82421L6.66683 9.49088ZM12.0002 9.3335C11.632 9.3335 11.3335 9.03502 11.3335 8.66683C11.3335 8.29864 11.632 8.00016 12.0002 8.00016C12.3684 8.00016 12.6668 8.29864 12.6668 8.66683C12.6668 9.03502 12.3684 9.3335 12.0002 9.3335Z"
          className={className}
        />
      );
    case 'SetVerifier':
      return (
        <path
          d="M6.52205 5.88382L12 4.6665L17.4779 5.88382C17.783 5.95161 18 6.22215 18 6.53462V13.1924C18 14.5298 17.3316 15.7788 16.2188 16.5206L12 19.3332L7.7812 16.5206C6.66841 15.7788 6 14.5298 6 13.1924V6.53462C6 6.22215 6.21702 5.95161 6.52205 5.88382ZM7.33333 7.0694V13.1924C7.33333 14.084 7.77893 14.9166 8.5208 15.4112L12 17.7307L15.4792 15.4112C16.2211 14.9166 16.6667 14.084 16.6667 13.1924V7.0694L12 6.03236L7.33333 7.0694ZM12 11.3332C11.0795 11.3332 10.3333 10.587 10.3333 9.6665C10.3333 8.74603 11.0795 7.99984 12 7.99984C12.9205 7.99984 13.6667 8.74603 13.6667 9.6665C13.6667 10.587 12.9205 11.3332 12 11.3332ZM9.01831 14.6665C9.18413 13.1665 10.4558 11.9998 12 11.9998C13.5442 11.9998 14.8159 13.1665 14.9817 14.6665H9.01831Z"
          className={className}
        />
      );
    case 'TokenAdd':
      return (
        <path
          d="M12.0031 18.6688C8.3212 18.6688 5.33643 15.684 5.33643 12.0021C5.33643 8.32022 8.3212 5.33545 12.0031 5.33545C15.685 5.33545 18.6698 8.32022 18.6698 12.0021C18.6698 15.684 15.685 18.6688 12.0031 18.6688ZM12.0031 17.3354C14.9486 17.3354 17.3364 14.9476 17.3364 12.0021C17.3364 9.0566 14.9486 6.66878 12.0031 6.66878C9.05757 6.66878 6.66976 9.0566 6.66976 12.0021C6.66976 14.9476 9.05757 17.3354 12.0031 17.3354ZM12.0031 8.70228L15.3029 12.0021L12.0031 15.302L8.70327 12.0021L12.0031 8.70228ZM12.0031 10.5879L10.5889 12.0021L12.0031 13.4164L13.4173 12.0021L12.0031 10.5879Z"
          className={className}
        />
      );
    case 'TokenRemove':
      return (
        <path
          d="M15.3335 8.00016H18.6668V9.3335H17.3335V18.0002C17.3335 18.3684 17.035 18.6668 16.6668 18.6668H7.3335C6.96531 18.6668 6.66683 18.3684 6.66683 18.0002V9.3335H5.3335V8.00016H8.66683V6.00016C8.66683 5.63198 8.96531 5.3335 9.3335 5.3335H14.6668C15.035 5.3335 15.3335 5.63198 15.3335 6.00016V8.00016ZM16.0002 9.3335H8.00016V17.3335H16.0002V9.3335ZM10.0002 6.66683V8.00016H14.0002V6.66683H10.0002Z"
          className={className}
        />
      );
    case 'WrappingFeeUpdate':
      return (
        <path
          d="M15.6701 18.0019C14.3814 18.0019 13.3368 16.9573 13.3368 15.6686C13.3368 14.3799 14.3814 13.3353 15.6701 13.3353C16.9588 13.3353 18.0034 14.3799 18.0034 15.6686C18.0034 16.9573 16.9588 18.0019 15.6701 18.0019ZM15.6701 16.6686C16.2224 16.6686 16.6701 16.2209 16.6701 15.6686C16.6701 15.1163 16.2224 14.6686 15.6701 14.6686C15.1178 14.6686 14.6701 15.1163 14.6701 15.6686C14.6701 16.2209 15.1178 16.6686 15.6701 16.6686ZM8.33675 10.6686C7.04809 10.6686 6.00342 9.62395 6.00342 8.33529C6.00342 7.04662 7.04809 6.00195 8.33675 6.00195C9.62542 6.00195 10.6701 7.04662 10.6701 8.33529C10.6701 9.62395 9.62542 10.6686 8.33675 10.6686ZM8.33675 9.33529C8.88904 9.33529 9.33675 8.88757 9.33675 8.33529C9.33675 7.783 8.88904 7.33529 8.33675 7.33529C7.78447 7.33529 7.33675 7.783 7.33675 8.33529C7.33675 8.88757 7.78447 9.33529 8.33675 9.33529ZM16.7175 6.3451L17.6603 7.28791L7.28938 17.6588L6.34656 16.716L16.7175 6.3451Z"
          className={className}
        />
      );
  }
};
