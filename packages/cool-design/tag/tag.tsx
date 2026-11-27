import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, type PropType } from 'vue';
import { useConfig, type Size } from '../config-provider/context';
export type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TagEffect = 'light' | 'plain' | 'dark';
export default defineComponent({
  name: 'i-tag',
  props: {
    type: { type: String as PropType<TagType>, default: 'primary' },
    effect: { type: String as PropType<TagEffect>, default: 'light' },
    size: String as PropType<Size>,
    closable: Boolean,
    disableTransitions: Boolean,
    disabled: Boolean,
    color: String,
    round: Boolean,
    hit: Boolean
  },
  emits: ['click', 'close'],
  setup(props, { slots, emit }) {
    const ns = useNamespace('tag');
    const config = useConfig();
    return () => (
      <span
        class={[
          ns.b(),
          `${ns.b()}--${props.type}`,
          `${ns.b()}--${props.effect}`,
          `${ns.b()}--${props.size || config.value.size}`,
          {
            [ns.m('disabled')]: props.disabled,
            [ns.m('round')]: props.round,
            [ns.m('hit')]: props.hit,
            [ns.m('disable-transitions')]: props.disableTransitions
          }
        ]}
        style={props.color ? { background: props.color } : undefined}
        onClick={(event: MouseEvent) => {
          if (!props.disabled) emit('click', event);
        }}>
        {slots.default?.()}
        {props.closable && (
          <button
            type='button'
            aria-label='移除标签'
            disabled={props.disabled}
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              if (!props.disabled) emit('close', event);
            }}>
            ×
          </button>
        )}
      </span>
    );
  }
});
