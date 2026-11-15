import { computed, defineComponent, inject, provide } from 'vue';
import { menuKey, menuPathKey } from './context';

export default defineComponent({
  name: 'i-sub-menu',
  props: {
    index: { type: String, required: true },
    disabled: Boolean
  },
  setup(props, { slots }) {
    const menu = inject(menuKey, undefined);
    const parentPath = inject(menuPathKey, []);
    const indexPath = computed(() => [...parentPath, props.index]);
    provide(menuPathKey, indexPath.value);

    const opened = computed(() => menu?.isOpened(props.index) ?? false);

    const toggle = () => {
      if (props.disabled || !menu) return;
      if (opened.value) menu.handleClose(props.index, indexPath.value);
      else menu.handleOpen(props.index, indexPath.value);
    };

    const handleTitleClick = () => {
      if (!menu) return;
      // 垂直模式始终点击展开；水平模式遵循 menuTrigger
      if (menu.mode === 'vertical' || menu.menuTrigger === 'click' || menu.collapse) toggle();
    };

    const handleMouseEnter = () => {
      if (!menu || props.disabled) return;
      if (menu.mode === 'horizontal' && menu.menuTrigger === 'hover' && !menu.collapse) {
        menu.handleOpen(props.index, indexPath.value);
      }
    };

    const handleMouseLeave = () => {
      if (!menu || props.disabled) return;
      if (menu.mode === 'horizontal' && menu.menuTrigger === 'hover' && !menu.collapse) {
        menu.handleClose(props.index, indexPath.value);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!opened.value) toggle();
      } else if (event.key === 'Escape') {
        if (opened.value) toggle();
      }
    };

    // provide 需要响应式：使用 computed 值
    // 注意：provide 在 setup 中只能调用一次，这里用 getter 保持响应

    return () => (
      <li
        class={{
          'i-sub-menu': true,
          'is-opened': opened.value,
          'is-disabled': props.disabled
        }}
        role='none'
        onMouseenter={handleMouseEnter}
        onMouseleave={handleMouseLeave}>
        <button
          type='button'
          class='i-sub-menu__title'
          disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          aria-expanded={opened.value}
          aria-haspopup='true'
          onClick={handleTitleClick}
          onKeydown={handleKeydown}>
          <span class='i-sub-menu__label'>{slots.title?.()}</span>
          <span class='i-sub-menu__arrow' aria-hidden='true'>
            ‹
          </span>
        </button>
        {opened.value && (
          <ul class='i-sub-menu__children' role='menu'>
            {slots.default?.()}
          </ul>
        )}
      </li>
    );
  }
});
