import { computed, defineComponent, getCurrentInstance, onBeforeUnmount, provide, ref, watch, type CSSProperties, type PropType, type Ref } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import {
  menuKey, menuPopperProps,
  type MenuItemClicked, type MenuItemData, type MenuMode, type MenuRoute, type MenuRouterResult, type MenuTrigger
} from './context';
import Overflow from './overflow';
import IMenuItem from './menu-item';
import ISubMenu from './sub-menu';

export type { MenuItemData, MenuMode, MenuTrigger };
export type MenuItem = MenuItemData;

const isIndexPath = (path: string[]) => Array.isArray(path) && path.every((entry) => typeof entry === 'string');
const isMenuEvent = (index: string, path: string[]) => typeof index === 'string' && isIndexPath(path);
const samePath = (a: string[], b: string[]) => a.length === b.length && a.every((entry, index) => entry === b[index]);

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
    ellipsis: { type: Boolean, default: true },
    ...menuPopperProps,
    popperOffset: { type: Number, default: 6 },
    popperEffect: { type: String, default: 'light' },
    teleported: { type: Boolean, default: undefined },
    persistent: { type: Boolean, default: true },
    showTimeout: { type: Number, default: 300 },
    hideTimeout: { type: Number, default: 300 }
  },
  emits: {
    'update:modelValue': (index: string) => typeof index === 'string',
    select: (index: string, path: string[], item: MenuItemClicked, routerResult?: MenuRouterResult) =>
      isMenuEvent(index, path) && !!item && (routerResult === undefined || routerResult instanceof Promise),
    open: isMenuEvent,
    close: isMenuEvent
  },
  setup(props, { emit, slots, expose }) {
    const ns = useNamespace('menu');
    const overflow = ref<{ handleResize(): void; close(): void }>();
    const instance = getCurrentInstance();
    const internalActive = ref(props.modelValue ?? props.defaultActive ?? '');
    const opened = ref<string[]>(props.collapse && props.mode === 'vertical' ? [] : [...props.defaultOpeneds]);
    const paths = new Set<Ref<string[]>>();
    const pendingCloses = new Map<string, { path: string[]; timer: ReturnType<typeof setTimeout> }>();

    const cancelClose = (index: string) => {
      clearTimeout(pendingCloses.get(index)?.timer);
      pendingCloses.delete(index);
    };
    onBeforeUnmount(() => pendingCloses.forEach((_, index) => cancelClose(index)));

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
    watch(() => props.collapse && props.mode === 'vertical', (collapsed) => {
      opened.value = collapsed ? [] : [...props.defaultOpeneds];
    });

    const activeIndex = computed(() => props.modelValue ?? internalActive.value);
    const themeStyle = computed<CSSProperties>(() => ({
      backgroundColor: props.backgroundColor || undefined,
      color: props.textColor || undefined,
      [ns.cssVarName('menu-active-color')]: props.activeTextColor || undefined
    }));

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

    let selection = 0;
    const activate = (index: string) => {
      internalActive.value = index;
      emit('update:modelValue', index);
    };
    const handleSelect = (item: MenuItemClicked) => {
      overflow.value?.close();
      const currentSelection = ++selection;
      const { index, indexPath } = item;
      if (props.mode === 'horizontal' || props.collapse) opened.value = [];
      if (props.router) {
        const router = instance?.appContext.config.globalProperties.$router as {
          push?: (target: MenuRoute) => void | Error | MenuRouterResult;
        } | undefined;
        if (typeof router?.push === 'function') {
          const route = item.route ?? item.to ?? index;
          const result = Promise.resolve(router.push(route)).then((failure) => {
            if (!failure && currentSelection === selection) activate(index);
            return failure;
          });
          emit('select', index, indexPath, { ...item, route }, result);
          return;
        }
      }
      activate(index);
      emit('select', index, indexPath, item);
    };

    const handleOpen = (index: string, indexPath: string[]) => {
      cancelClose(index);
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
      cancelClose(index);
      if (!opened.value.includes(index)) return;
      opened.value = opened.value.filter((key) => key !== index);
      emit('close', index, indexPath);
    };

    const scheduleClose = (index: string, indexPath: string[], delay: number) => {
      cancelClose(index);
      const timer = setTimeout(() => handleClose(index, indexPath), delay);
      pendingCloses.set(index, { path: indexPath, timer });
    };

    const getPath = (index: string) => [...paths].find((path) => path.value[path.value.length - 1] === index)?.value ??
      findPath(props.items, index) ?? [index];
    const open = (index: string) => {
      const path = getPath(index);
      path.forEach((entry, i) => handleOpen(entry, path.slice(0, i + 1)));
    };
    const close = (index: string) => {
      handleClose(index, getPath(index));
    };
    const updateActiveIndex = (index?: string) => {
      if (index !== undefined) {
        internalActive.value = index;
        emit('update:modelValue', index);
      } else {
        internalActive.value = props.modelValue ?? props.defaultActive ?? '';
      }
    };
    const handleResize = () => overflow.value?.handleResize();

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
      get activeColorVar() {
        return ns.cssVarName('menu-active-color');
      },
      get activeTextColor() {
        return props.activeTextColor;
      },
      get themeStyle() {
        return themeStyle.value;
      },
      get popperProps() {
        return {
          offset: props.popperOffset,
          effect: props.popperEffect,
          popperClass: props.popperClass,
          popperStyle: props.popperStyle,
          teleported: props.teleported,
          persistent: props.persistent,
          showTimeout: props.showTimeout,
          hideTimeout: props.hideTimeout
        };
      },
      isActive,
      collapsedClass(childNamespace, element) {
        if (props.collapse && childNamespace !== ns.namespace.value) return ns.e(element);
      },
      isOpened,
      handleSelect,
      handleOpen,
      handleClose,
      scheduleClose,
      cancelClose,
      registerPath(path) {
        const index = path.value[path.value.length - 1];
        const pending = pendingCloses.get(index);
        if (pending && !samePath(pending.path, path.value)) cancelClose(index);
        paths.add(path);
        const stop = watch(path, (current, previous) => {
          if (samePath(current, previous)) return;
          const oldIndex = previous[previous.length - 1];
          pendingCloses.forEach(({ path: pendingPath }, index) => {
            if (pendingPath.includes(oldIndex)) cancelClose(index);
          });
        }, { flush: 'sync' });
        return () => {
          stop();
          paths.delete(path);
        };
      }
    });

    const renderItems = (items: MenuItemData[]) =>
      items.map((item) => {
        if (item.children?.length) {
          return (
            <ISubMenu key={item.index} index={item.index} disabled={item.disabled}>
              {{
                title: () => item.label,
                default: () => renderItems(item.children ?? [])
              }}
            </ISubMenu>
          );
        }
        return (
          <IMenuItem key={item.index} index={item.index} disabled={item.disabled} route={item.route} to={item.to}>
            {{ default: () => item.label }}
          </IMenuItem>
        );
      });

    return () => {
      const children = () => slots.default?.() ?? renderItems(props.items);
      const listClass = { [ns.e('list')]: true, 'no-transition': !props.collapseTransition };
      return (
        <nav
          class={{
            [ns.b()]: true,
            [`is-${props.mode}`]: true,
            'is-collapse': props.collapse,
            'is-ellipsis': props.ellipsis
          }}
          style={themeStyle.value}>
          {props.mode === 'horizontal' && props.ellipsis ? <Overflow ref={overflow} class={listClass}>{children}</Overflow> : <ul
            class={listClass}
            role='menubar'
            aria-orientation={props.mode === 'horizontal' ? 'horizontal' : 'vertical'}>
            {children()}
          </ul>}
        </nav>
      );
    };
  }
});
