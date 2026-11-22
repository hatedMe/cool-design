import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, type PropType } from 'vue';
export default defineComponent({
  name: 'i-card',
  props: {
    header: String,
    footer: String,
    bodyStyle: Object as PropType<Record<string, string>>,
    headerClass: { type: String, default: '' },
    bodyClass: { type: String, default: '' },
    footerClass: { type: String, default: '' },
    shadow: { type: String as PropType<'always' | 'hover' | 'never'>, default: 'always' },
    border: { type: Boolean, default: true }
  },
  setup(props, { slots }) {
    const ns = useNamespace('card');
    return () => (
      <section class={{ [ns.b()]: true, 'is-bordered': props.border, [`is-shadow-${props.shadow}`]: true }}>
        {(props.header || slots.header) && (
          <header class={[ns.e('header'), props.headerClass]}>{slots.header?.() ?? props.header}</header>
        )}
        <div class={[ns.e('body'), props.bodyClass]} style={props.bodyStyle}>
          {slots.default?.()}
        </div>
        {(props.footer || slots.footer) && (
          <footer class={[ns.e('footer'), props.footerClass]}>{slots.footer?.() ?? props.footer}</footer>
        )}
      </section>
    );
  }
});
