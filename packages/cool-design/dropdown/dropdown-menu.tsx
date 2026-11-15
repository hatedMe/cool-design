import { defineComponent } from 'vue';

export default defineComponent({
  name: 'i-dropdown-menu',
  setup(_, { slots }) {
    return () => (
      <ul class='i-dropdown__menu' role='menu'>
        {slots.default?.()}
      </ul>
    );
  }
});
