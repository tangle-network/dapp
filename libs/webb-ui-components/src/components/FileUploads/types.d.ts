import { DropzoneOptions } from 'react-dropzone';
import { PropsOf } from '../../types';

export interface FileUploadAreaProps extends PropsOf<'div'> {
  /**
   * Callback for when the drop event occurs.
   */
  onDrop?: DropzoneOptions['onDrop'];

  /**
   * The accepted file types
   * @default 'application/json': ['json']
   * @see
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
   */
  accept?: DropzoneOptions['accept'];

  /**
   * The maximum file size (in bytes)
   * @default 1024 * 1024 * 50 // (50MB)
   */
  maxSize?: DropzoneOptions['maxSize'];

  /**
   * Maximum accepted number of files.
   * @default 1
   */
  maxFiles?: number;
}

export interface FileUploadListProps extends PropsOf<'ul'> {
  /**
   * The title of the list.
   */
  title?: string;
}

export interface FileUploadItemProps extends PropsOf<'li'> {
  /**
   * The icon to display
   */
  Icon: React.ReactElement;

  /**
   * The file name
   * @default 'Untitled'
   * @example 'my-file.json'
   */
  fileName?: string;

  /**
   * The extra information to display below the file name
   */
  extraInfo?: React.ReactNode;

  /**
   * Callback for when the remove button is clicked.
   * @default () => {}
   * @example () => console.log('Remove button clicked')
   */
  onRemove?: () => void;
}

export interface FileUploadFieldProps {
  /**
   * The note value
   */
  value?: string;

  /**
   * The callback for when the note value changes.
   */
  onChange?: (value: string) => void;

  /**
   * The callback for when the upload button is clicked.
   */
  onUpload?: (note: string) => void | Promise<void>;

  /**
   * The error message to display.
   */
  error?: string;
}
