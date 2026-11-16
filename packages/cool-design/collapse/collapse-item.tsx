import { computed, defineComponent, inject, onBeforeUnmount, type Component, type PropType } from 'vue';
import Icon from '../icon';
import { collapseKey, type CollapseName } from './context';

let itemId = 0;

export default defineComponent({
  name: 'i-collapse-item',
  props: {
    name: { type: [String, Number] as PropType<CollapseName>, default: undefined },
    title: { type: String, default: '' },
    disabled: Boolean,
    icon: { type: [String, Object, Function] as PropType<string | Component>, default: undefined }
  },
  setup(props, { slots }) {
    const context = inject(collapseKey);
    if (!context) throw new Error('CollapseItem must be used inside Collapse.');
    const uid = Symbol('collapse-item');
    const fallback = context.register(uid);
    onBeforeUnmount(() => context.unregister(uid));
    const id = ++itemId;
    const headerId = `i-collapse-header-${id}`;
    const panelId = `i-collapse-panel-${id}`;

    const itemName = computed(() => props.name ?? fallback);
    const expanded = computed(() => context.activeNames.value.includes(itemName.value));
    const arrow = () =>
      slots.icon?.() ??
      (props.icon ? (
        <Icon icon={props.icon} class='i-collapse-item__icon' />
      ) : (
        <span class='i-collapse-item__arrow' aria-hidden='true'>
          ›
        </span>
      ));

    return () => (
      <div
        class={{
          'i-collapse-item': true,
          'is-active': expanded.value,
          'is-disabled': props.disabled
        }}>
        <button
          type='button'
          id={headerId}
          class='i-collapse-item__header'
          aria-expanded={expanded.value}
          aria-controls={panelId}
          disabled={props.disabled}
          onClick={() => !props.disabled && context.toggle(itemName.value)}>
          {context.expandIconPosition.value === 'left' && arrow()}
          <span class='i-collapse-item__title'>{slots.title?.() ?? props.title}</span>
          {context.expandIconPosition.value === 'right' && arrow()}
        </button>
        <div
          id={panelId}
          class='i-collapse-item__wrap'
          role='region'
          aria-labelledby={headerId}
          style={expanded.value ? undefined : { display: 'none' }}>
          <div class='i-collapse-item__content'>{slots.default?.()}</div>
        </div>
      </div>
    );
  }
});
