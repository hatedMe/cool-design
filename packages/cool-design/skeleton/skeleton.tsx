import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-skeleton',
  props: {
    loading: { type: Boolean, default: true },
    animated: Boolean,
    rows: { type: Number, default: 3 },
    title: Boolean,
    avatar: Boolean
  },
  setup(props, { slots }) {
    return () =>
      props.loading ? (
        <div class={{ 'i-skeleton': true, 'is-animated': props.animated }}>
          {props.avatar && <i class='i-skeleton__avatar' />}
          {props.title && <i class='i-skeleton__title' />}
          {Array.from({ length: props.rows }, (_, i) => (
            <i class='i-skeleton__row' key={i} />
          ))}
        </div>
      ) : (
        <>{slots.default?.()}</>
      );
  }
});
