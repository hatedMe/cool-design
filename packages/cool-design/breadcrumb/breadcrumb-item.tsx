import { computed, defineComponent, getCurrentInstance, h, inject, onBeforeUnmount, onMounted, type PropType } from 'vue';
import { breadcrumbKey } from './context';

export type BreadcrumbTo = string | Record<string, unknown>;

export default defineComponent({
  name: 'i-breadcrumb-item',
  props: {
    to: { type: [String, Object] as PropType<BreadcrumbTo>, default: undefined },
    replace: Boolean
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
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
    };

    return () => {
      const customSeparator = slots.separator?.() ?? parent?.separatorSlot?.();
      const icon = parent?.separatorIcon;
      const separatorContent = customSeparator ?? (
        icon ? (
          typeof icon === 'string' ? (
            icon
          ) : (
            h(icon as never)
          )
        ) : (
          (parent?.separator ?? '/')
        )
      );
      const inner = href.value ? (
        <a
          href={href.value}
          class='i-breadcrumb__inner'
          aria-current={isLast.value ? 'page' : undefined}
          onClick={handleClick}>
          {slots.default?.()}
        </a>
      ) : (
        <span class='i-breadcrumb__inner' aria-current={isLast.value ? 'page' : undefined}>
          {slots.default?.()}
        </span>
      );
      return (
        <li class={{ 'i-breadcrumb__item': true, 'is-last': isLast.value }}>
          {inner}
          <span class='i-breadcrumb__separator' aria-hidden='true'>
            {separatorContent}
          </span>
        </li>
      );
    };
  }
});
