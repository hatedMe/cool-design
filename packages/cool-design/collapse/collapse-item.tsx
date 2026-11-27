import { Transition, computed, defineComponent, inject, onBeforeUnmount, ref, vShow, withDirectives, type Component, type PropType } from 'vue';
import { avoidIdCollision, createSlotIds, reserveSlotIds } from '../../../src/utils/slot-ids';
import { useId } from '../../hooks/use-id';
import { useNamespace } from '../../hooks/use-namespace';
import Icon from '../icon';
import { collapseKey, type CollapseName } from './context';

export default defineComponent({
  name: 'i-collapse-item',
  props: {
    name: { type: [String, Number] as PropType<CollapseName>, default: undefined },
    title: { type: String, default: '' },
    disabled: Boolean,
    icon: { type: [String, Object, Function] as PropType<string | Component>, default: undefined }
  },
  setup(props, { attrs, slots, expose }) {
    const context = inject(collapseKey);
    if (!context) throw new Error('CollapseItem must be used inside Collapse.');
    const ns = useNamespace('collapse-item');
    const transition = useNamespace('collapse');
    const header = ref<HTMLButtonElement>();
    const fallback = context.register(header);
    onBeforeUnmount(() => context.unregister(header));
    const id = useId();

    const itemName = computed(() => props.name ?? fallback);
    const expanded = computed(() => context.activeNames.value.includes(itemName.value));
    const arrow = () =>
      slots.icon?.({ isActive: expanded.value }) ??
      (props.icon ? (
        <Icon icon={props.icon} class={ns.e('icon')} />
      ) : (
        <span class={ns.e('arrow')} aria-hidden='true'>
          ›
        </span>
      ));

    // 高度过渡：展开从 0 到内容高，收起反向；0.2s 的 height 过渡由样式类提供。
    const beforeEnter = (el: Element) => {
      const wrap = el as HTMLElement;
      wrap.style.height = '0px';
      wrap.style.overflow = 'hidden';
    };
    const enter = (el: Element) => {
      const wrap = el as HTMLElement;
      wrap.style.height = `${wrap.scrollHeight}px`;
    };
    const afterEnter = (el: Element) => {
      const wrap = el as HTMLElement;
      wrap.style.height = '';
      wrap.style.overflow = '';
    };
    const beforeLeave = (el: Element) => {
      const wrap = el as HTMLElement;
      wrap.style.height = `${wrap.scrollHeight}px`;
      wrap.style.overflow = 'hidden';
    };
    const leave = (el: Element) => {
      const wrap = el as HTMLElement;
      // 强制浏览器记录当前高度，再折叠到 0。
      void wrap.offsetHeight;
      wrap.style.height = '0px';
    };
    const afterLeave = (el: Element) => {
      const wrap = el as HTMLElement;
      wrap.style.height = '';
      wrap.style.overflow = '';
    };

    expose({ isActive: computed(() => expanded.value) });

    return () => {
      const left = context.expandIconPosition.value === 'left' && arrow();
      const title = slots.title?.({ isActive: expanded.value }) ?? props.title;
      const right = context.expandIconPosition.value === 'right' && arrow();
      const body = slots.default?.();
      const reserved = createSlotIds(attrs.id);
      reserveSlotIds(reserved, left);
      reserveSlotIds(reserved, title);
      reserveSlotIds(reserved, right);
      reserveSlotIds(reserved, body);
      const headerId = avoidIdCollision(`${id.value}-collapse-header`, reserved);
      const panelId = avoidIdCollision(`${id.value}-collapse-panel`, reserved);
      return (
        <div
          class={[ns.b(), ns.is('active', expanded.value), ns.is('disabled', props.disabled)]}>
          <button
            ref={header}
            type='button'
            id={headerId}
            class={ns.e('header')}
            aria-expanded={expanded.value}
            aria-controls={panelId}
            disabled={props.disabled}
            onClick={() => !props.disabled && context.toggle(itemName.value)}>
            {left}
            <span class={ns.e('title')}>{title}</span>
            {right}
          </button>
          <Transition
            name={transition.b()}
            onBeforeEnter={beforeEnter}
            onEnter={enter}
            onAfterEnter={afterEnter}
            onBeforeLeave={beforeLeave}
            onLeave={leave}
            onAfterLeave={afterLeave}>
            {withDirectives(
              <div id={panelId} class={ns.e('wrap')} role='region' aria-labelledby={headerId}>
                <div class={ns.e('content')}>{body}</div>
              </div>,
              [[vShow, expanded.value]]
            )}
          </Transition>
        </div>
      );
    };
  }
});
