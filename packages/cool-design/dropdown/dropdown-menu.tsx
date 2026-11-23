import { defineComponent, inject } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { dropdownKey } from './context';

export default defineComponent({
  name: 'i-dropdown-menu',
  setup(_, { slots }) {
    const ns = useNamespace('dropdown');
    const parent = inject(dropdownKey, undefined);
    return () => (
      <ul data-dropdown-menu='' class={ns.e('menu')} role={parent?.role ?? 'menu'} aria-labelledby={parent?.id}>
        {slots.default?.()}
      </ul>
    );
  }
});
