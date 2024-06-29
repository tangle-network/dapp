import { Validator } from '../../types';
import createNominee, { CreateNomineeOptions } from './createNominee';

interface Options extends CreateNomineeOptions {}

const createValidator = (options: Options): Validator => {
  return createNominee(options);
};

export default createValidator;
