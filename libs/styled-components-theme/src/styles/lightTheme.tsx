import { lightPallet } from '../styling/colors';
import { createGlobalStyle } from 'styled-components';

export const LightTheme = createGlobalStyle`
	:root {
		--color-primary: #173dc9;
		--color-primary-light: #2938ce;
		--color-primary-hover: #1b4af3;
		--color-primary-active: #0c30ae;

		--color-blue: #108ee9;
		--color-green: #48b87e;
		--color-red: #e02020;
		--color-red-light: #ff5a5a;
		--color-yellow: #f0fa41;
		--color-orange: #f7b500;
		--color-white: #ffffff;
		--color-gray: #cccccc;
		--color-red-light: #ff5a5a;

		--color-success: var(--color-green);
		--color-error: var(--color-red);
		--color-alert: var(--color-yellow);
		--color-info: var(--color-blue);
		--color-warning: var(--color-orange);

		--accent-color: ${lightPallet.accentColor};
		--checkbox-color: '#000'
		--border-color: #e9e9e9;
		--dividing-color: #ecf0f2;

		--text-size-sm: 14px;
		--text-size-md: 16px;
		--text-size-lg: 18px;
		--text-size-xl: 24px;

		--text-weight-light: 400;
		--text-weight-md: 500;

		--text-color-black: #000000;
		--text-color-white: #ffffff;
		--text-color-primary: #333333;
		--text-color-normal: #666666;
		--text-color-second: #999999;

		--screen-small: 960px;
		--screen-middle: 1440px;
		--screen-large: 1920px;

		--tab-border: #ebeef5;

		--list-item-background: linear-gradient(90deg, #e5eaff 0%, #f5f6fa 100%) #ffffff;

		--card-shadow: 0 0 21px rgba(23, 65, 212, 0.15);

		--sidebar-item-height: 58px;

		--information-background: #edf3ff;
		--information-title-color: #0155ff;
		--information-content-color: #95ADDC;

		--notification-success-color: #8fce65;
		--notification-info-color: #108ee9;
		--notification-warning-color: #f0af41;
		--notification-error-color: #f35600;

		--notification-message-color: #404040;
		--notification-description-color: #666666;

		--table-striped-background: #f7faff;

		--input-border-color: rgba(1, 85, 255, 1);
		--input-shadow: rgba(1, 85, 255, 0.2);
		--input-border-color-error: rgba(255, 90, 90, 1);
		--input-shadow-error: rgba(255, 90, 90, 0.2);
	}

	.active-menu-item {
		path: {
			fill: ${lightPallet.accentColor};
		}
	}

	/* overwrite ant style */
	.ant-steps-item-process .ant-steps-item-icon {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	.ant-steps-item-finish .ant-steps-item-icon {
		border-color: var(--color-primary);
	}

	.ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
		color: var(--color-primary);
	}

	.ant-dropdown-menu {
		border-radius: 12px;
	}

	body {
		background: ${lightPallet.componentBackground} !important;
	}
`;
