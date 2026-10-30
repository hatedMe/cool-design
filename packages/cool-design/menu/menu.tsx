import { defineComponent, type PropType } from 'vue';
export interface MenuItem {
  index: string;
  label: string;
  disabled?: boolean;
  children?: MenuItem[];
}
export default defineComponent({
  name: 'i-menu',
  props: {
    modelValue: { type: String, default: '' },
    items: { type: Array as PropType<MenuItem[]>, default: () => [] },
    mode: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
    collapse: Boolean,
    uniqueOpened: Boolean
  },
  emits: ['update:modelValue', 'select', 'open', 'close'],
  setup(props, { emit }) {
    const render = (items: MenuItem[]) =>
      items.map((item) => (
        <li class={{ 'is-active': props.modelValue === item.index, 'is-disabled': item.disabled }} key={item.index}>
          <button
            type='button'
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                emit('update:modelValue', item.index);
                emit('select', item.index, item);
              }
            }}>
            {item.label}
          </button>
          {item.children && <ul>{render(item.children)}</ul>}
        </li>
      ));
    return () => (
      <nav class={{ 'i-menu': true, [`is-${props.mode}`]: true, 'is-collapse': props.collapse }}>
        <ul>{render(props.items)}</ul>
      </nav>
    );
  }
});
