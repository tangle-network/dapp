import { BehaviorSubject } from 'rxjs';

const isReceiveModalOpenSubject = new BehaviorSubject<boolean>(false);
const setReceiveModalOpen = (isOpen: boolean) =>
  isReceiveModalOpenSubject.next(isOpen);

export default {
  isReceiveModalOpenSubject,
  setReceiveModalOpen,
};
