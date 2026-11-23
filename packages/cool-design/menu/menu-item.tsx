import { computed, defineComponent, inject, normalizeClass, normalizeStyle, type CSSProperties, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { menuKey, menuPathKey, type MenuRoute } from './context';
import Tooltip from '../tooltip';

export default defineComponent({
  name: 'i-menu-item',
  props: {
    index: { type: String, required: true },
    disabled: Boolean,
    route: { type: [String, Object] as PropType<MenuRoute>, default: undefined },
    to: { type: [String, Object] as PropType<MenuRoute>, default: undefined }
  },
  emits: { click: (event: MouseEvent) => event instanceof MouseEvent },
  setup(props, { slots, emit }) {
    const ns = useNamespace('menu-item');
    const menu = inject(menuKey, undefined);
    const parentPath = inject(menuPathKey, undefined);
    const indexPath = computed(() => [...(parentPath?.value ?? []), props.index]);
    const active = computed(() => menu?.isActive(props.index) ?? false);
    const activeColorStyle = computed<CSSProperties | undefined>(() => {
      if (!menu || menu.activeColorVar === ns.cssVarName('menu-active-color')) return;
      // 局部变量仍由 CSS 级联决定，传送面板缺少根变量时回退到显式菜单颜色。
      const rootColor = menu.activeTextColor ? `, ${menu.activeTextColor}` : '';
      return { [ns.cssVarName('menu-active-color-fallback')]: `var(${menu.activeColorVar}${rootColor})` };
    });
    // 折叠模式下的一级菜单项通过 Tooltip 展示完整标题
    const collapsedTooltip = computed(
      () => !!menu?.collapse && menu.mode === 'vertical' && !parentPath
    );

    const select = () => menu?.handleSelect({
      index: props.index,
      indexPath: indexPath.value,
      route: props.route,
      to: props.to
    });

    const handleClick = (event: MouseEvent) => {
      emit('click', event);
      if (props.disabled) return;
      select();
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      }
    };

    return () => {
      const button = (
        <button
          type='button'
          class={ns.e('button')}
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
          class={{ [ns.b()]: true, 'is-active': active.value, 'is-disabled': props.disabled }}
          style={activeColorStyle.value}
          role='menuitem'
          aria-disabled={props.disabled || undefined}>
          {collapsedTooltip.value ? (
            <Tooltip
              placement='right'
              offset={menu?.popperProps.offset}
              effect={menu?.popperProps.effect}
              popperClass={normalizeClass(menu?.popperProps.popperClass)}
              popperStyle={normalizeStyle([menu?.themeStyle, menu?.popperProps.popperStyle])}
              teleported={menu?.popperProps.teleported}
              disabled={props.disabled}>
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
