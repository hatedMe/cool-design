import { useNamespace } from '../../hooks/use-namespace';
import {
  Comment, Fragment, Text, cloneVNode, createTextVNode, defineComponent, h, isVNode, normalizeClass, normalizeStyle, provide,
  type ComponentOptionsMixin, type CSSProperties, type DefineComponent, type ExtractPropTypes, type PropType, type VNode
} from 'vue';
import type { Placement } from '@popperjs/core';
import { createNamespace } from '../../../src/utils/create';
import { withInstall } from '../../../src/utils/with-install';
import Avatar, { type AvatarShape, type AvatarSize } from '../avatar/avatar';
import { avatarGroupKey } from '../avatar/group-context';
import '../avatar/index.scss';
import Tooltip from '../tooltip';
import './index.scss';

type ClassValue = string | false | null | undefined | Record<string, unknown> | ClassValue[];
type StyleValue = string | CSSProperties | false | null | undefined | StyleValue[];
const classProp = { type: [String, Array, Object, Boolean] as PropType<ClassValue>, default: undefined };
const styleProp = { type: [String, Array, Object, Boolean] as PropType<StyleValue>, default: undefined };
const [name] = createNamespace('avatar-group');
const countKey = Symbol('avatar-group-count');

const avatarGroupProps = {
  size: [Number, String] as PropType<Exclude<AvatarSize, 'medium'>>,
  shape: String as PropType<AvatarShape>,
  collapseAvatars: Boolean,
  collapseAvatarsTooltip: Boolean,
  maxCollapseAvatars: { type: Number, default: 1 },
  effect: { type: String, default: 'light' },
  placement: { type: String as PropType<Placement>, default: 'top' },
  popperClass: classProp,
  popperStyle: styleProp,
  collapseClass: classProp,
  collapseStyle: styleProp
};

export type AvatarGroupProps = Partial<ExtractPropTypes<typeof avatarGroupProps>>;
export type AvatarGroupSlots = {
  default?: () => VNode[];
};

type ScopedKeys = Map<PropertyKey, { key: symbol; children: ScopedKeys }>;

const Component = defineComponent({
  name,
  props: avatarGroupProps,
  setup(props, { slots }) {
    const ns = useNamespace('avatar-group');
    provide(avatarGroupKey, props);
    let previousKeys: ScopedKeys = new Map();

    return () => {
      const avatars: VNode[] = [];
      const nextKeys: ScopedKeys = new Map();
      // Fragment 内的 key 只在同级有效。展平时保留它的作用域及重排后的身份。
      const flatten = (children: readonly unknown[], previous: ScopedKeys | undefined, next: ScopedKeys, nested = false) => {
        let unkeyedFragments = 0;
        let unkeyedNodes = 0;
        children.forEach((child) => {
          const node = isVNode(child) ? child :
            typeof child === 'string' || typeof child === 'number' ? createTextVNode(String(child)) : undefined;
          const children = Array.isArray(child) ? child :
            node?.type === Fragment && Array.isArray(node.children) ? node.children : undefined;
          if (!children && (!node || node.type === Comment || (node.type === Text && !String(node.children).trim()))) return;
          const fragment = children !== undefined || node?.type === Fragment;
          if (!fragment && !nested) {
            if (node) avatars.push(node);
            return;
          }

          const sourceKey = node?.key;
          const localKey = typeof sourceKey === 'symbol' ? sourceKey :
            sourceKey != null ? `${typeof sourceKey}:${sourceKey}` :
              fragment ? `fragment:${unkeyedFragments++}` : unkeyedNodes++;
          const old = previous?.get(localKey);
          const scope = { key: old?.key ?? Symbol(), children: new Map() };
          next.set(localKey, scope);
          if (children) {
            flatten(children, old?.children, scope.children, true);
          } else if (node && !fragment) {
            avatars.push(cloneVNode(node, { key: scope.key }));
          }
        });
      };
      flatten(slots.default?.() ?? [], previousKeys, nextKeys);
      previousKeys = nextKeys;

      const max = props.maxCollapseAvatars;
      const collapsed = props.collapseAvatars && avatars.length > max;
      if (!collapsed) return <div class={ns.b()}>{avatars}</div>;

      const visible = avatars.slice(0, max);
      const hidden = avatars.slice(max);
      const count = () => h(Avatar, {
        class: normalizeClass(props.collapseClass),
        style: normalizeStyle(props.collapseStyle),
        tabindex: props.collapseAvatarsTooltip ? 0 : undefined
      }, () => `+ ${hidden.length}`);

      return (
        <div class={ns.b()}>
          {visible}
          <Tooltip
            key={countKey}
            triggerClass={ns.e('trigger')}
            disabled={!props.collapseAvatarsTooltip}
            effect={props.effect}
            placement={props.placement}
            popperClass={normalizeClass(props.popperClass)}
            popperStyle={normalizeStyle(props.popperStyle)}
          >
            {{
              default: count,
              content: () => <div class={ns.e('collapse-avatars')}>{hidden.map((node) => cloneVNode(node))}</div>
            }}
          </Tooltip>
        </div>
      );
    };
  }
});

// 保留 Vue 3.2 的构造类型，并替换公开实例的默认插槽签名。
type EmptyOptions = Record<never, never>;
type AvatarGroupOptions = DefineComponent<typeof avatarGroupProps, EmptyOptions, EmptyOptions, EmptyOptions, EmptyOptions,
  ComponentOptionsMixin, ComponentOptionsMixin, EmptyOptions, never>;
type AvatarGroupComponent = Omit<AvatarGroupOptions, never> &
  (new (...args: ConstructorParameters<AvatarGroupOptions>) =>
    Omit<InstanceType<AvatarGroupOptions>, '$slots'> & { $slots: AvatarGroupSlots });

const AvatarGroup: ReturnType<typeof withInstall<AvatarGroupComponent>> = withInstall(Component) as
  unknown as ReturnType<typeof withInstall<AvatarGroupComponent>>;
export default AvatarGroup;
