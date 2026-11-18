import { computed, defineComponent, getCurrentInstance, provide, ref, watch, type PropType } from 'vue';
import { menuKey, menuPathKey, type MenuItemData, type MenuMode, type MenuTrigger } from './context';
import IMenuItem from './menu-item';
import ISubMenu from './sub-menu';

export type { MenuItemData, MenuMode, MenuTrigger };
export type MenuItem = MenuItemData;

export default defineComponent({
  name: 'i-menu',
  props: {
    modelValue: { type: String, default: undefined },
    defaultActive: { type: String, default: '' },
    items: { type: Array as PropType<MenuItemData[]>, default: () => [] },
    mode: { type: String as PropType<MenuMode>, default: 'vertical' },
    collapse: Boolean,
    uniqueOpened: { type: Boolean, default: false },
    menuTrigger: { type: String as PropType<MenuTrigger>, default: 'hover' },
    defaultOpeneds: { type: Array as PropType<string[]>, default: () => [] },
    collapseTransition: { type: Boolean, default: true },
    backgroundColor: { type: String, default: '' },
    textColor: { type: String, default: '' },
    activeTextColor: { type: String, default: '' },
    router: Boolean,
    ellipsis: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'select', 'open', 'close'],
  setup(props, { emit, slots, expose }) {
    const instance = getCurrentInstance();
    const internalActive = ref(props.modelValue ?? props.defaultActive ?? '');
    const opened = ref<string[]>([...(props.defaultOpeneds ?? [])]);

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) internalActive.value = value;
      }
    );
    watch(
      () => props.defaultActive,
      (value) => {
        if (props.modelValue === undefined) internalActive.value = value ?? '';
      }
    );
    watch(
      () => props.defaultOpeneds,
      (value) => {
        opened.value = [...(value ?? [])];
      },
      { deep: true }
    );

    const activeIndex = computed(() => props.modelValue ?? internalActive.value);

    const isActive = (index: string) => activeIndex.value === index;
    const isOpened = (index: string) => opened.value.includes(index);

    const findPath = (items: MenuItemData[], target: string, base: string[] = []): string[] | null => {
      for (const item of items) {
        const path = [...base, item.index];
        if (item.index === target) return path;
        if (item.children?.length) {
          const found = findPath(item.children, target, path);
          if (found) return found;
        }
      }
      return null;
    };

    const handleSelect = (index: string, indexPath: string[], item?: unknown) => {
      internalActive.value = index;
      emit('update:modelValue', index);
      emit('select', index, indexPath, item);
      if (props.router) {
        const router = instance?.appContext.config.globalProperties.$router;
        const meta = item as { route?: unknown; to?: unknown } | undefined;
        const target = meta?.route ?? meta?.to ?? index;
        if (router && typeof router.push === 'function') void router.push(target);
      }
    };

    const handleOpen = (index: string, indexPath: string[]) => {
      if (opened.value.includes(index)) return;
      if (props.uniqueOpened) {
        const ancestors = new Set(indexPath.slice(0, -1));
        opened.value = [...opened.value.filter((key) => ancestors.has(key)), index];
      } else {
        opened.value = [...opened.value, index];
      }
      emit('open', index, indexPath);
    };

    const handleClose = (index: string, indexPath: string[]) => {
      if (!opened.value.includes(index)) return;
      opened.value = opened.value.filter((key) => key !== index);
      emit('close', index, indexPath);
    };

    const open = (index: string) => {
      const path = findPath(props.items, index) ?? [index];
      handleOpen(index, path);
    };
    const close = (index: string) => {
      const path = findPath(props.items, index) ?? [index];
      handleClose(index, path);
    };
    const updateActiveIndex = (index?: string) => {
      if (index !== undefined) {
        internalActive.value = index;
        emit('update:modelValue', index);
      } else {
        internalActive.value = props.modelValue ?? props.defaultActive ?? '';
      }
    };
    const handleResize = () => {
      // 兼容标准方法名：本库使用 CSS 响应式，无需手动计算
    };

    expose({ open, close, updateActiveIndex, handleResize });

    provide(menuKey, {
      activeIndex,
      opened,
      get mode() {
        return props.mode;
      },
      get collapse() {
        return props.collapse;
      },
      get uniqueOpened() {
        return props.uniqueOpened;
      },
      get menuTrigger() {
        return props.menuTrigger;
      },
      isActive,
      isOpened,
      handleSelect,
      handleOpen,
      handleClose
    });
    provide(menuPathKey, []);

    const renderItems = (items: MenuItemData[]) =>
      items.map((item) => {
        if (item.children?.length) {
          return (
            <ISubMenu index={item.index} disabled={item.disabled}>
              {{
                title: () => item.label,
                default: () => renderItems(item.children ?? [])
              }}
            </ISubMenu>
          );
        }
        return (
          <IMenuItem index={item.index} disabled={item.disabled} route={item.route} to={item.to}>
            {{ default: () => item.label }}
          </IMenuItem>
        );
      });

    return () => {
      const hasSlot = !!slots.default;
      return (
        <nav
          class={{
            'i-menu': true,
            [`is-${props.mode}`]: true,
            'is-collapse': props.collapse,
            'is-ellipsis': props.ellipsis
          }}
          style={
            props.backgroundColor || props.textColor || props.activeTextColor
              ? {
                  backgroundColor: props.backgroundColor || undefined,
                  color: props.textColor || undefined,
                  '--i-menu-active-color': props.activeTextColor || undefined
                }
              : undefined
          }>
          <ul
            class={{ 'i-menu__list': true, 'no-transition': !props.collapseTransition }}
            role='menubar'
            aria-orientation={props.mode === 'horizontal' ? 'horizontal' : 'vertical'}>
            {hasSlot ? slots.default?.() : renderItems(props.items)}
          </ul>
        </nav>
      );
    };
  }
});
