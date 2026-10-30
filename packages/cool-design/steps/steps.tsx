import { defineComponent, type PropType } from 'vue';
export interface StepItem {
  title: string;
  description?: string;
  icon?: string;
  status?: 'wait' | 'process' | 'finish' | 'error' | 'success';
}
export default defineComponent({
  name: 'i-steps',
  props: {
    active: { type: Number, default: 0 },
    items: { type: Array as PropType<StepItem[]>, default: () => [] },
    direction: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    finishStatus: { type: String, default: 'finish' }
  },
  emits: ['change'],
  setup(props, { emit, slots }) {
    return () => (
      <div class={['i-steps', `is-${props.direction}`]}>
        {props.items.map((item, index) => (
          <div
            class={{
              'i-steps__item': true,
              'is-finish': index < props.active,
              'is-process': index === props.active,
              'is-wait': index > props.active
            }}
            key={item.title}
            onClick={() => emit('change', index)}>
            <div class='i-steps__head'>
              <i>{item.icon ?? index + 1}</i>
            </div>
            <div>
              <strong>{slots[`title-${index}`]?.() ?? item.title}</strong>
              {item.description && <p>{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }
});
