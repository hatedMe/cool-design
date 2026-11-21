import { defineComponent, inject, onBeforeUnmount, watch } from 'vue';
import { anchorKey } from './context';

export default defineComponent({
  name: 'i-anchor-link',
  props: {
    href: { type: String, required: true },
    title: String
  },
  setup(props, { slots }) {
    const anchor = inject(anchorKey, undefined);
    anchor?.register(props.href);
    watch(
      () => props.href,
      (href, old) => {
        anchor?.unregister(old);
        anchor?.register(href);
      }
    );
    onBeforeUnmount(() => anchor?.unregister(props.href));
    return () => (
      <div class='i-anchor__item'>
        <a
          class={['i-anchor__link', anchor?.activeHref() === props.href && 'is-active']}
          href={props.href}
          title={props.title}
          onClick={(event: MouseEvent) => anchor?.handleClick(event, props.href)}>
          {slots.default?.() ?? props.title}
        </a>
        {slots['sub-link'] && <div class='i-anchor__sub'>{slots['sub-link']()}</div>}
      </div>
    );
  }
});
