import { withInstall } from '../../../src/utils/with-install';
import Component from './upload';
export const Upload = withInstall(Component);
export default Upload;
export type { UploadBeforeResult, UploadData, UploadDataRecord, UploadDataValue, UploadFile, UploadFiles, UploadProgressEvent, UploadRawFile, UploadRequestOptions, UploadStatus, UploadUserFile } from './upload';
