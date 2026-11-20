import { withInstall } from '../../../src/utils/with-install';
import Component from './statistic';
export interface StatisticInstance {
  readonly displayValue: string;
}
export const Statistic = withInstall<typeof Component, StatisticInstance>(Component);
export default Statistic;
export type { StatisticFormatter, StatisticValue } from './statistic';
