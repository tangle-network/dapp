import { Banner, Typography } from '@webb-tools/webb-ui-components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Banner',
  component: Banner,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Banner {...args} />;

export const BridgeDapp = Template.bind({});
BridgeDapp.args = {
  dappName: 'bridge',
  bannerText: 'Hubble Bridge is in beta version.',
  buttonText: 'Report Bug',
  onClose: () => {},
};

export const StatsDapp = Template.bind({});
StatsDapp.args = {
  dappName: 'stats',
  bannerText: 'Stats dApp is in beta version.',
  buttonText: 'Report Bug',
  onClose: () => {},
};

export const WithoutButton = Template.bind({});
WithoutButton.args = {
  dappName: 'bridge',
  bannerText: 'Hubble Bridge is in beta version.',
  onClose: () => {},
};
