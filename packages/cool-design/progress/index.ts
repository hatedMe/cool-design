import { withInstall } from '../../../src/utils/with-install';
import Component from './progress';
import './index.scss';

export const Progress = withInstall(Component);
export default Progress;
export type {
  ProgressColor,
  ProgressColorStop,
  ProgressFormat,
  ProgressStatus,
  ProgressStrokeLinecap,
  ProgressType
} from './progress';
