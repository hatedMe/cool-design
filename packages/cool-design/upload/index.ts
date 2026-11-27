import type { UploadFile } from './upload';
import { withInstall } from '../../../src/utils/with-install';
import Component from './upload';
import DraggerComponent from './upload-dragger';
export interface UploadInstance {
  submit(): Promise<void[]>;
  abort(file?: UploadFile): void;
  clearFiles(): void;
  handleStart(file: File): Promise<void>;
  handleRemove(file: UploadFile, checkBeforeRemove?: boolean): Promise<void>;
}
export const Upload = withInstall<typeof Component, UploadInstance>(Component);
export const UploadDragger = withInstall(DraggerComponent);
export default Upload;
export type { UploadBeforeResult, UploadData, UploadDataRecord, UploadDataValue, UploadFile, UploadFiles, UploadProgressEvent, UploadRawFile, UploadRequestOptions, UploadStatus, UploadUserFile } from './upload';
