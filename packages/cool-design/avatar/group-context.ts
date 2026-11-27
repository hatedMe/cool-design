import type { InjectionKey } from 'vue';
import type { AvatarShape, AvatarSize } from './avatar';

export const avatarGroupKey: InjectionKey<Readonly<{ size?: AvatarSize; shape?: AvatarShape }>> = Symbol('avatar-group');
