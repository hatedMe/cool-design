import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'i-transfer-panel',
  props: { title: String, filterable: Boolean, disabled: Boolean, placeholder: String },
  setup(props, { expose, slots }) {
    const ns = useNamespace('transfer');
    const query = ref('');
    expose({ query });
    return () => (
      <section class={ns.e('panel')} aria-label={props.title}>
        {slots.header?.()}
        {props.filterable && (
          <input class={ns.e('filter')} type='text' value={query.value}
            placeholder={props.placeholder} aria-label={props.placeholder} disabled={props.disabled}
            onInput={(event: Event) => {
              if (!props.disabled) query.value = (event.target as HTMLInputElement).value;
            }} />
        )}
        {slots.default?.()}
      </section>
    );
  }
});
