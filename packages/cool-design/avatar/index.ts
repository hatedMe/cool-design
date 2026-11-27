import type { App } from 'vue';
import { withInstall } from '../../../src/utils/with-install';
import AvatarGroup from '../avatar-group';
import './index.scss';
import _Avatar from './avatar';

const component = withInstall(_Avatar);
const installAvatar = component.install;
export const Avatar: ReturnType<typeof withInstall<typeof _Avatar>> & { AvatarGroup: typeof AvatarGroup } = Object.assign(component, {
  AvatarGroup,
  install(app: App) {
    installAvatar(app);
    if (app.component('i-avatar-group') !== AvatarGroup) app.use(AvatarGroup);
  }
});
export type { AvatarSize, AvatarShape, AvatarFit } from './avatar';
export default Avatar;
