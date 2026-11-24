import { defineComponent, inject } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { menuBranchKey, menuKey } from './context';

export default defineComponent({
  name: 'i-menu-item-group',
  props: {
    title: { type: String, default: '' }
  },
  setup(props, { slots }) {
    const ns = useNamespace('menu-item-group');
    const menu = inject(menuKey, undefined);
    const branch = inject(menuBranchKey, undefined);
    return () => (
      <li class={ns.b()} role='none'>
        <div class={ns.e('title')}>{slots.title?.() ?? props.title}</div>
        <ul class={[ns.e('children'), branch?.popupGroupClass(ns.namespace.value, menu)]} role='group'>
          {slots.default?.()}
        </ul>
      </li>
    );
  }
});
