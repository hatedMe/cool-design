import { withInstall } from '../../../src/utils/with-install';
import Component from './config-provider';
export const ConfigProvider = withInstall(Component);
export default ConfigProvider;
export { useLocale, zhCn, en } from './context';
export type { ButtonConfigContext, Config, DialogConfigContext, Language, LinkConfigContext, MessageConfigContext, TableConfigContext, ValueOnClear } from './context';
