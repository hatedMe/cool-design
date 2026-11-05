import { withInstall } from '../../../src/utils/with-install';
import Component from './upload';
export const Upload = withInstall(Component);
export default Upload;
export type { UploadFile, UploadFiles, UploadRawFile, UploadRequestOptions, UploadStatus, UploadUserFile } from './upload';
