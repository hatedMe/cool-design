import { defineComponent, inject, onBeforeUnmount, provide, watch, type InjectionKey } from 'vue';
import { anchorKey, type AnchorContext } from './context';
import { useNamespace } from '../../hooks/use-namespace';

const subLinkOwnerKey: InjectionKey<AnchorContext | null> = Symbol('anchor-sub-link-owner');

const AnchorSubLinks = defineComponent({
  setup(_, { slots }) {
    provide(subLinkOwnerKey, inject(anchorKey, null));
    return () => <div>{slots.default?.()}</div>;
  }
});

export default defineComponent({
  name: 'i-anchor-link',
  props: {
    href: { type: String, required: true },
    title: String
  },
  setup(props, { slots }) {
    const ns = useNamespace('anchor');
    const anchor = inject(anchorKey, undefined);
    const isSubLink = inject(subLinkOwnerKey, undefined) === (anchor ?? null);
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
      <div class={ns.e('item')} data-anchor-horizontal={anchor?.layout.direction === 'horizontal' ? '' : undefined}>
        <a
          class={[ns.e('link'), anchor?.activeHref() === props.href && 'is-active']}
          data-anchor-horizontal={anchor?.layout.direction === 'horizontal' ? '' : undefined}
          data-anchor-underline={anchor?.layout.type === 'underline' ? '' : undefined}
          data-anchor-sub-link={isSubLink ? '' : undefined}
          href={props.href}
          title={props.title}
          onClick={(event: MouseEvent) => anchor?.handleClick(event, props.href)}>
          {slots.default?.() ?? props.title}
        </a>
        {slots['sub-link'] && (
          <AnchorSubLinks class={ns.e('sub')} v-slots={{ default: slots['sub-link'] }} />
        )}
      </div>
    );
  }
});
