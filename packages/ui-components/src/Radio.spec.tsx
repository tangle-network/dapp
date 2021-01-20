import React from 'react';
import { shallow, render } from 'enzyme';

import { Radio } from './Radio';
import classes from './Radio.module.scss';

describe('<Radio />', () => {
  it('render <Radio /> component', () => {
    const wrapper = shallow(<Radio label='Test' />);

    expect(wrapper.find(`.${classes.root}`)).toHaveLength(1);
  });

  it('render <Radio /> label', () => {
    const wrapper = render(<Radio label='Test' />);
    
    expect(wrapper.find(`.${classes.label}`)).toHaveLength(1);
    expect(wrapper.find(`.${classes.label}`).first().html()).toEqual('Test');
  });

  it('render <Radio /> disabled', () => {
    const wrapper = shallow(<Radio label='Test' disabled />);
    
    expect(wrapper.find(`.${classes.disabled}`)).toHaveLength(1);
  });

  it('render <Radio /> checked', () => {
    const wrapper = shallow(<Radio label='Test' checked />);
    
    expect(wrapper.find(`.${classes.checked}`)).toHaveLength(1);
  });
});