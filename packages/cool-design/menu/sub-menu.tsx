import {
  computed, defineComponent, getCurrentInstance, h, inject, nextTick, normalizeClass, normalizeStyle,
  onBeforeUnmount, provide, shallowRef, vShow, watch, withDirectives, type Component, type PropType
} from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import Tooltip, { type TooltipInstance } from '../tooltip';
import { menuBranchKey, menuKey, menuPathKey, menuPopperProps } from './context';

const iconType = [String, Object, Function] as PropType<string | Component>;
const bottomPlacements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'] as const;
const sidePlacements = ['right-start', 'right', 'right-end', 'left-start', 'bottom-start', 'bottom-end', 'top-start', 'top-end'] as const;

export default defineComponent({
  name: 'i-sub-menu',
  props: {
    index: { type: String, required: true },
    disabled: Boolean,
    ...menuPopperProps,
    popperOffset: Number,
    teleported: { type: Boolean, default: undefined },
    showTimeout: Number,
    hideTimeout: Number,
    expandCloseIcon: iconType,
    expandOpenIcon: iconType,
    collapseCloseIcon: iconType,
    collapseOpenIcon: iconType
  },
  setup(props, { slots, expose }) {
    const ns = useNamespace('sub-menu');
    const owner = getCurrentInstance();
    const menu = inject(menuKey, undefined);
    const parentPath = inject(menuPathKey, undefined);
    const parentBranch = inject(menuBranchKey, undefined);
    const indexPath = computed(() => [...(parentPath?.value ?? []), props.index]);
    const unregisterPath = menu?.registerPath(indexPath);
    provide(menuPathKey, indexPath);

    const firstLevel = !parentPath;
    const horizontal = computed(() => menu?.mode === 'horizontal');
    const popupMode = computed(() => horizontal.value || menu?.collapse === true);
    const bottomPopup = computed(() => horizontal.value && firstLevel && !parentBranch?.overflow?.value);
    const expandIcons = computed(() => bottomPopup.value || !popupMode.value);
    const hover = computed(() => popupMode.value && menu?.menuTrigger === 'hover' && !props.disabled);
    const opened = computed(() => menu?.isOpened(props.index) ?? false);
    const expanded = computed(() => opened.value && (parentBranch?.expanded.value ?? true));
    const popper = computed(() => menu?.popperProps);
    const teleported = computed(() => props.teleported ?? popper.value?.teleported ?? (firstLevel && !parentBranch?.overflow?.value));
    const icon = computed(() => {
      const close = expandIcons.value ? props.expandCloseIcon : props.collapseCloseIcon;
      const open = expandIcons.value ? props.expandOpenIcon : props.collapseOpenIcon;
      if (!close || !open) return;
      const value = opened.value ? open : close;
      return typeof value === 'string' ? owner?.appContext.components[value] : value;
    });

    const title = shallowRef<HTMLButtonElement>();
    const row = shallowRef<HTMLLIElement>();
    const panel = shallowRef<TooltipInstance>();
    const inline = shallowRef<HTMLUListElement>();
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    const clearTimers = () => {
      clearTimeout(showTimer);
      menu?.cancelClose(props.index);
    };
    const open = () => {
      if (!props.disabled) menu?.handleOpen(props.index, indexPath.value);
    };
    const close = () => menu?.handleClose(props.index, indexPath.value);
    const toggle = () => {
      clearTimers();
      if (opened.value) close();
      else open();
    };

    const hold = () => {
      clearTimers();
      parentBranch?.hold();
    };
    const leave = (event: MouseEvent) => {
      const target = event.relatedTarget;
      if (target instanceof Node && (row.value?.contains(target) || panel.value?.popperRef.contentRef?.contains(target))) {
        return;
      }
      if (hover.value) {
        clearTimers();
        if (opened.value) menu?.scheduleClose(props.index, indexPath.value, props.hideTimeout ?? popper.value?.hideTimeout ?? 300);
      }
      parentBranch?.leave(event);
    };
    provide(menuBranchKey, {
      expanded,
      hold,
      leave,
      popupGroupClass(childNamespace, childMenu) {
        if (childMenu === menu && popupMode.value && childNamespace !== ns.namespace.value) {
          return ns.e('popup-group');
        }
      }
    });

    const onMouseenter = () => {
      if (!hover.value) return;
      hold();
      if (!opened.value) showTimer = setTimeout(open, props.showTimeout ?? popper.value?.showTimeout ?? 300);
    };
    watch(() => panel.value?.popperRef.contentRef, (element, _, onCleanup) => {
      if (!element) return;
      element.addEventListener('mouseenter', hold);
      element.addEventListener('mouseleave', leave);
      onCleanup(() => {
        element.removeEventListener('mouseenter', hold);
        element.removeEventListener('mouseleave', leave);
      });
    }, { flush: 'post' });
    watch([hover, opened, () => props.index], clearTimers);
    watch(() => parentBranch?.expanded.value, (visible) => {
      // 父级隐藏后取消无效的展开请求，子级已安排的关闭仍需更新展开状态。
      if (visible === false) clearTimeout(showTimer);
    });

    const dismiss = (event: Event) => {
      clearTimers();
      close();
      if (event instanceof KeyboardEvent) title.value?.focus({ preventScroll: true });
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled || event.isComposing) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      } else if (event.key === 'ArrowDown' || (popupMode.value && event.key === 'ArrowRight')) {
        event.preventDefault();
        clearTimers();
        open();
        void nextTick(async () => {
          await panel.value?.updatePopper();
          await nextTick();
          const children = panel.value?.popperRef.contentRef ?? inline.value;
          if (expanded.value) children?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
        });
      } else if (event.key === 'Escape' && opened.value) {
        event.preventDefault();
        dismiss(event);
      }
    };
    onBeforeUnmount(() => {
      clearTimeout(showTimer);
      // 父浮层离场销毁内容后，根菜单仍需要完成已预约的逻辑关闭。
      if (popper.value?.persistent !== false || parentBranch?.expanded.value !== false || !popupMode.value) {
        menu?.cancelClose(props.index);
      }
      unregisterPath?.();
    });
    expose({ opened });

    return () => {
      const button = (
        <button
          type='button'
          class={[ns.e('title'), menu?.collapsedClass(ns.namespace.value, 'collapsed-button')]}
          ref={title}
          disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          aria-expanded={expanded.value}
          aria-haspopup='true'
          onClick={() => {
            if (!props.disabled && (!horizontal.value || menu?.menuTrigger === 'click')) toggle();
          }}
          onKeydown={handleKeydown}>
          <span class={ns.e('label')}>{slots.title?.()}</span>
          <span
            class={[ns.e('arrow'), { 'is-side': !expandIcons.value, 'is-custom': icon.value }]}
            aria-hidden='true'>
            {icon.value ? h(icon.value) : '‹'}
          </span>
        </button>
      );
      return (
        <li
          ref={row}
          class={[ns.b(), { 'is-opened': expanded.value, 'is-disabled': props.disabled }]}
          role='none'
          onMouseenter={onMouseenter}
          onMouseleave={leave}>
          {popupMode.value ? (
            <Tooltip
              ref={panel}
              triggerClass={menu?.collapsedClass(ns.namespace.value, 'collapsed-trigger')}
              visible={expanded.value}
              onUpdate:visible={() => undefined}
              onDismiss={dismiss}
              trigger={[]}
              triggerKeys={[]}
              closeOnOutside
              contentRole='menu'
              persistent={popper.value?.persistent}
              effect={popper.value?.effect}
              popperClass={normalizeClass([
                ns.e('popup'),
                ns.em('popup', popper.value?.effect ?? 'light'),
                props.popperClass ?? popper.value?.popperClass
              ])}
              popperStyle={normalizeStyle([menu?.themeStyle, props.popperStyle ?? popper.value?.popperStyle])}
              offset={props.popperOffset ?? popper.value?.offset}
              placement={bottomPopup.value ? 'bottom-start' : 'right-start'}
              fallbackPlacements={[...(bottomPopup.value ? bottomPlacements : sidePlacements)]}
              teleported={teleported.value}
              showArrow={false}
              gpuAcceleration={false}>
              {{
                default: () => button,
                content: () => (
                  <>
                    {!horizontal.value && firstLevel && <div class={ns.e('popup-title')}>{slots.title?.()}</div>}
                    <ul class={ns.e('children')} role='menu'>{slots.default?.()}</ul>
                  </>
                )
              }}
            </Tooltip>
          ) : (
            <>
              {button}
              {withDirectives(
                <ul ref={inline} class={ns.e('children')} role='menu'>{slots.default?.()}</ul>,
                [[vShow, expanded.value]]
              )}
            </>
          )}
        </li>
      );
    };
  }
});
