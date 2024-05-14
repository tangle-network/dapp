import downloadBlob from './downloadBlob.js';
import stringIntoBlob from './stringIntoBlob.js';

function downloadString(
  text: string,
  fileName: string,
  fileType = 'plan/text'
) {
  const textBlob = stringIntoBlob(text, fileType);
  downloadBlob(textBlob, fileType, fileName);
}

export default downloadString;
