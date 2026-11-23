import { defineComponent } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';

export default defineComponent({
  name: 'i-menu-item-group',
  props: {
    title: { type: String, default: '' }
  },
  setup(props, { slots }) {
    const ns = useNamespace('menu-item-group');
    return () => (
      <li class={ns.b()} role='none'>
        <div class={ns.e('title')}>{slots.title?.() ?? props.title}</div>
        <ul class={ns.e('children')} role='group'>
          {slots.default?.()}
        </ul>
      </li>
    );
  }
});
