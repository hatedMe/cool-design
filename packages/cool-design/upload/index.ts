import { withInstall } from '../../../src/utils/with-install';
import Component from './upload';
import DraggerComponent from './upload-dragger';
export const Upload = withInstall(Component);
export const UploadDragger = withInstall(DraggerComponent);
export default Upload;
export type { UploadBeforeResult, UploadData, UploadDataRecord, UploadDataValue, UploadFile, UploadFiles, UploadProgressEvent, UploadRawFile, UploadRequestOptions, UploadStatus, UploadUserFile } from './upload';
