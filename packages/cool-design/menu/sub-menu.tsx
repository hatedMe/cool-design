import { Teleport, computed, defineComponent, inject, onBeforeUnmount, provide, ref, watch } from 'vue';
import { menuKey, menuPathKey } from './context';
import { useFloating } from '../../../src/utils/use-floating';

export default defineComponent({
  name: 'i-sub-menu',
  props: {
    index: { type: String, required: true },
    disabled: Boolean,
    showTimeout: { type: Number, default: undefined },
    hideTimeout: { type: Number, default: undefined }
  },
  setup(props, { slots }) {
    const menu = inject(menuKey, undefined);
    const parentPath = inject(menuPathKey, []);
    const indexPath = computed(() => [...parentPath, props.index]);
    provide(menuPathKey, indexPath.value);

    const opened = computed(() => menu?.isOpened(props.index) ?? false);
    const isFirstLevel = parentPath.length === 0;
    // 折叠模式下，一级子菜单通过浮层弹层展示
    const popupMode = computed(() => !!menu?.collapse && menu.mode === 'vertical' && isFirstLevel);

    const titleRef = ref<HTMLElement>();
    const popupRef = ref<HTMLElement>();
    const popupOpen = ref(false);
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const clearTimers = () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      showTimer = undefined;
      hideTimer = undefined;
    };
    // 展开延时依次回退：子菜单自身 → 菜单级配置 → 默认值
    const showTimeout = () => props.showTimeout ?? menu?.popperProps.showTimeout ?? 300;
    const hideTimeout = () => props.hideTimeout ?? menu?.popperProps.hideTimeout ?? 300;

    const floating = useFloating({
      open: popupOpen,
      reference: titleRef,
      floating: popupRef,
      placement: () => 'right-start',
      offset: () => menu?.popperProps.offset ?? 4,
      close: () => {
        popupOpen.value = false;
      }
    });

    const openPopup = () => {
      if (props.disabled) return;
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = undefined;
      }
      if (popupOpen.value) return;
      const delay = showTimeout();
      showTimer = setTimeout(() => {
        popupOpen.value = true;
      }, delay);
    };
    const closePopup = (immediate = false) => {
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = undefined;
      }
      if (!popupOpen.value) return;
      if (immediate) {
        clearTimers();
        popupOpen.value = false;
        return;
      }
      hideTimer = setTimeout(() => {
        popupOpen.value = false;
      }, hideTimeout());
    };
    const keepPopup = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = undefined;
      }
    };
    const togglePopup = () => {
      clearTimers();
      popupOpen.value = !popupOpen.value;
    };

    watch(popupMode, (mode) => {
      if (!mode) {
        clearTimers();
        popupOpen.value = false;
      }
    });

    const toggleInline = () => {
      if (props.disabled || !menu) return;
      if (opened.value) menu.handleClose(props.index, indexPath.value);
      else menu.handleOpen(props.index, indexPath.value);
    };

    const handleTitleClick = () => {
      if (!menu) return;
      if (popupMode.value) {
        togglePopup();
        return;
      }
      // 垂直模式始终点击展开；水平模式遵循 menuTrigger
      if (menu.mode === 'vertical' || menu.menuTrigger === 'click' || menu.collapse) toggleInline();
    };

    const handleMouseEnter = () => {
      if (!menu || props.disabled) return;
      if (popupMode.value) {
        if (menu.menuTrigger === 'hover') openPopup();
        return;
      }
      if (menu.mode === 'horizontal' && menu.menuTrigger === 'hover' && !menu.collapse) {
        menu.handleOpen(props.index, indexPath.value);
      }
    };

    const handleMouseLeave = () => {
      if (!menu || props.disabled) return;
      if (popupMode.value) {
        if (menu.menuTrigger === 'hover') closePopup();
        return;
      }
      if (menu.mode === 'horizontal' && menu.menuTrigger === 'hover' && !menu.collapse) {
        menu.handleClose(props.index, indexPath.value);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (popupMode.value) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          togglePopup();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          clearTimers();
          popupOpen.value = true;
        } else if (event.key === 'Escape') {
          closePopup(true);
        }
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleInline();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!opened.value) toggleInline();
      } else if (event.key === 'Escape') {
        if (opened.value) toggleInline();
      }
    };

    // 弹层内点击叶子菜单项后自动收起
    const handlePopupClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest('.i-menu-item')) closePopup(true);
    };

    onBeforeUnmount(clearTimers);

    return () => (
      <li
        class={{
          'i-sub-menu': true,
          'is-opened': opened.value || (popupMode.value && popupOpen.value),
          'is-disabled': props.disabled
        }}
        role='none'
        onMouseenter={handleMouseEnter}
        onMouseleave={handleMouseLeave}>
        <button
          type='button'
          class='i-sub-menu__title'
          ref={titleRef}
          disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          aria-expanded={popupMode.value ? popupOpen.value : opened.value}
          aria-haspopup='true'
          onClick={handleTitleClick}
          onKeydown={handleKeydown}>
          <span class='i-sub-menu__label'>{slots.title?.()}</span>
          <span class='i-sub-menu__arrow' aria-hidden='true'>
            ‹
          </span>
        </button>
        {popupMode.value
          ? popupOpen.value && (() => {
              const popper = menu?.popperProps;
              const panel = (
                <div
                  ref={popupRef}
                  class={[
                    'i-sub-menu__popup',
                    `i-sub-menu__popup--${popper?.effect ?? 'light'}`,
                    popper?.popperClass
                  ]}
                  role='menu'
                  style={floating.style.value}
                  onClick={handlePopupClick}
                  onMouseenter={keepPopup}
                  onMouseleave={() => closePopup()}>
                  <div class='i-sub-menu__popup-title'>{slots.title?.()}</div>
                  <ul class='i-sub-menu__children' role='menu'>
                    {slots.default?.()}
                  </ul>
                </div>
              );
              return popper?.teleported ? <Teleport to={floating.target.value}>{panel}</Teleport> : panel;
            })()
          : opened.value && (
              <ul class='i-sub-menu__children' role='menu'>
                {slots.default?.()}
              </ul>
            )}
      </li>
    );
  }
});
