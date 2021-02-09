import '@testing-library/jest-dom/extend-expect';

import Enzyme from 'enzyme';
/* eslint-disable */
// @ts-ignore
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
