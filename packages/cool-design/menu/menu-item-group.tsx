import { defineComponent } from 'vue';

export default defineComponent({
  name: 'i-menu-item-group',
  props: {
    title: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => (
      <li class='i-menu-item-group' role='none'>
        <div class='i-menu-item-group__title'>{slots.title?.() ?? props.title}</div>
        <ul class='i-menu-item-group__children' role='group'>
          {slots.default?.()}
        </ul>
      </li>
    );
  }
});
