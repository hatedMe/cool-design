import { defineComponent, h, type PropType, type Component } from 'vue';

export type TimelineItemType = '' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TimelineItemPlacement = 'top' | 'bottom';
export type TimelineItemSize = 'normal' | 'large';

export default defineComponent({
  name: 'i-timeline-item',
  props: {
    timestamp: { type: String, default: '' },
    hideTimestamp: Boolean,
    center: Boolean,
    placement: { type: String as PropType<TimelineItemPlacement>, default: 'bottom' },
    type: { type: String as PropType<TimelineItemType>, default: '' },
    color: { type: String, default: '' },
    size: { type: String as PropType<TimelineItemSize>, default: 'normal' },
    icon: { type: [String, Object] as PropType<string | Component>, default: undefined },
    hollow: Boolean
  },
  setup(props, { slots }) {
    return () => {
      const IconComp = props.icon as unknown as Component | string | undefined;
      const showTimestamp = !props.hideTimestamp && props.timestamp !== '';
      const nodeStyle = props.color
        ? props.hollow
          ? { borderColor: props.color, color: props.color }
          : { backgroundColor: props.color, borderColor: props.color }
        : undefined;
      const node = slots.dot ? (
        <div class='i-timeline-item__dot'>{slots.dot()}</div>
      ) : (
        <div
          class={[
            'i-timeline-item__node',
            `i-timeline-item__node--${props.size}`,
            props.type ? `i-timeline-item__node--${props.type}` : '',
            { 'is-hollow': props.hollow, 'is-icon': !!props.icon }
          ]}
          style={nodeStyle}>
          {typeof IconComp === 'string'
            ? IconComp
              ? <i class={IconComp} aria-hidden='true' />
              : null
            : IconComp
              ? h(IconComp as never)
              : null}
        </div>
      );
      return (
        <li class={['i-timeline-item', { 'is-center': props.center }]}>
          <div class='i-timeline-item__tail' aria-hidden='true' />
          {node}
          <div class='i-timeline-item__wrapper'>
            {props.placement === 'top' && showTimestamp && (
              <div class='i-timeline-item__timestamp is-top'>{props.timestamp}</div>
            )}
            <div class='i-timeline-item__content'>{slots.default?.()}</div>
            {props.placement === 'bottom' && showTimestamp && (
              <div class='i-timeline-item__timestamp is-bottom'>{props.timestamp}</div>
            )}
          </div>
        </li>
      );
    };
  }
});
