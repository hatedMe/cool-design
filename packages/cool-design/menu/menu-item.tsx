import { computed, defineComponent, inject, type PropType } from 'vue';
import { menuKey, menuPathKey } from './context';
import Tooltip from '../tooltip';

export default defineComponent({
  name: 'i-menu-item',
  props: {
    index: { type: String, required: true },
    disabled: Boolean,
    route: { type: [String, Object] as PropType<string | Record<string, unknown>>, default: undefined },
    to: { type: [String, Object] as PropType<string | Record<string, unknown>>, default: undefined }
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const menu = inject(menuKey, undefined);
    const parentPath = inject(menuPathKey, []);
    const indexPath = computed(() => [...parentPath, props.index]);
    const active = computed(() => menu?.isActive(props.index) ?? false);
    // 折叠模式下的一级菜单项通过 Tooltip 展示完整标题（对齐 Element Plus 行为）
    const collapsedTooltip = computed(
      () => !!menu?.collapse && menu.mode === 'vertical' && parentPath.length === 0
    );

    const handleClick = (event: MouseEvent) => {
      emit('click', event);
      if (props.disabled) return;
      menu?.handleSelect(props.index, indexPath.value, {
        index: props.index,
        route: props.route,
        to: props.to
      });
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        menu?.handleSelect(props.index, indexPath.value, {
          index: props.index,
          route: props.route,
          to: props.to
        });
      }
    };

    return () => {
      const button = (
        <button
          type='button'
          class='i-menu-item__button'
          disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          aria-current={active.value ? 'page' : undefined}
          onClick={handleClick}
          onKeydown={handleKeydown}>
          {slots.default?.() ?? slots.title?.()}
        </button>
      );
      return (
        <li
          class={{ 'i-menu-item': true, 'is-active': active.value, 'is-disabled': props.disabled }}
          role='menuitem'
          aria-disabled={props.disabled || undefined}>
          {collapsedTooltip.value ? (
            <Tooltip placement='right' offset={6} disabled={props.disabled}>
              {{
                default: () => button,
                content: () => slots.default?.() ?? slots.title?.()
              }}
            </Tooltip>
          ) : (
            button
          )}
        </li>
      );
    };
  }
});
