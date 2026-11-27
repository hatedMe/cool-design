import { computed, defineComponent, getCurrentInstance, h, inject, onBeforeUnmount, onMounted, type Component, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import Icon from '../icon';
import { breadcrumbKey } from './context';

export type BreadcrumbTo = string | Record<string, unknown>;

export default defineComponent({
  name: 'i-breadcrumb-item',
  props: {
    to: { type: [String, Object] as PropType<BreadcrumbTo>, default: undefined },
    replace: Boolean,
    icon: { type: [String, Object] as PropType<string | Component>, default: undefined }
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const ns = useNamespace('breadcrumb');
    const parent = inject(breadcrumbKey, undefined);
    const instance = getCurrentInstance();
    const uid = instance?.uid ?? Math.floor(Math.random() * 1000000);

    onMounted(() => parent?.register(uid));
    onBeforeUnmount(() => parent?.unregister(uid));

    const isLast = computed(() => parent?.isLast(uid) ?? false);

    const href = computed(() => {
      if (typeof props.to === 'string') return props.to;
      if (props.to && typeof props.to === 'object') {
        const to = props.to as Record<string, unknown>;
        if (typeof to.path === 'string') return to.path;
        if (typeof to.href === 'string') return to.href;
        return '#';
      }
      return undefined;
    });

    const handleClick = (event: MouseEvent) => {
      emit('click', event);
      if (event.defaultPrevented || !props.to) return;
      const router = instance?.appContext.config.globalProperties.$router;
      if (router && (typeof router.push === 'function' || typeof router.replace === 'function')) {
        event.preventDefault();
        const target = props.to;
        if (props.replace && typeof router.replace === 'function') void router.replace(target);
        else void router.push(target);
      }
    };

    return () => {
      const customSeparator = slots.separator?.() ?? parent?.separatorSlot?.();
      const icon = parent?.separatorIcon;
      const separatorContent = customSeparator ?? (
        icon ? (
          // 字符串按图标类名经 Icon 渲染，不再原样输出文本。
          typeof icon === 'string' ? (
            <Icon icon={icon} aria-hidden='true' />
          ) : (
            h(icon as never)
          )
        ) : (
          (parent?.separator ?? '/')
        )
      );
      const itemIcon = props.icon;
      const inner = href.value ? (
        <a
          href={href.value}
          class={ns.e('inner')}
          data-breadcrumb-link=''
          aria-current={isLast.value ? 'page' : undefined}
          onClick={handleClick}>
          {slots.default?.()}
        </a>
      ) : (
        <span class={ns.e('inner')} aria-current={isLast.value ? 'page' : undefined}>
          {slots.default?.()}
        </span>
      );
      return (
        <li class={{ [ns.e('item')]: true, 'is-last': isLast.value }}>
          {itemIcon && (
            <span class={ns.e('item-icon')} aria-hidden='true'>
              {typeof itemIcon === 'string' ? <Icon icon={itemIcon} /> : h(itemIcon as never)}
            </span>
          )}
          {inner}
          <span class={ns.e('separator')} aria-hidden='true'>
            {separatorContent}
          </span>
        </li>
      );
    };
  }
});
