export function stringIntoBlob(text: string, fileType = 'plan/text'): Blob {
  return new Blob([text], { type: fileType });
}
