import { defineComponent, inject } from 'vue';
import { dropdownKey } from './context';

export default defineComponent({
  name: 'i-dropdown-menu',
  setup(_, { slots }) {
    const parent = inject(dropdownKey, undefined);
    return () => (
      <ul class='i-dropdown__menu' role={parent?.role ?? 'menu'}>
        {slots.default?.()}
      </ul>
    );
  }
});
