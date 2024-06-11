import downloadBlob from './downloadBlob';
import stringIntoBlob from './stringIntoBlob';

function downloadString(
  text: string,
  fileName: string,
  fileType = 'plan/text',
) {
  const textBlob = stringIntoBlob(text, fileType);
  downloadBlob(textBlob, fileType, fileName);
}

export default downloadString;
