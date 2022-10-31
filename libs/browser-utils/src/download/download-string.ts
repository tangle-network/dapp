import { downloadBlob } from './download-blob';
import { stringIntoBlob } from './string-into-blob';

export function downloadString(text: string, fileName: string, fileType = 'plan/text') {
  const textBlob = stringIntoBlob(text, fileType);
  downloadBlob(textBlob, fileType, fileName);
}
