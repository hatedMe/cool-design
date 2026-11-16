import { Comment, Fragment, defineComponent, type PropType, type VNode } from 'vue';
import ITimelineItem, {
  type TimelineItemPlacement,
  type TimelineItemSize,
  type TimelineItemType
} from './timeline-item';

export type TimelineMode = 'start' | 'end' | 'alternate' | 'alternate-reverse';

export interface TimelineItem {
  timestamp?: string;
  hideTimestamp?: boolean;
  center?: boolean;
  placement?: TimelineItemPlacement;
  type?: TimelineItemType;
  color?: string;
  size?: TimelineItemSize;
  icon?: string;
  hollow?: boolean;
  content?: string;
}

const flatten = (nodes: VNode[]): VNode[] => {
  const result: VNode[] = [];
  nodes.forEach((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flatten(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  });
  return result;
};

export default defineComponent({
  name: 'i-timeline',
  props: {
    items: { type: Array as PropType<TimelineItem[]>, default: () => [] },
    reverse: Boolean,
    mode: { type: String as PropType<TimelineMode>, default: 'start' }
  },
  setup(props, { slots }) {
    return () => {
      const orderedItems = props.reverse ? [...props.items].reverse() : props.items;
      const renderItems = () =>
        orderedItems.map((item, index) => (
          <ITimelineItem
            key={`${item.timestamp ?? ''}-${index}`}
            timestamp={item.timestamp ?? ''}
            hideTimestamp={item.hideTimestamp}
            center={item.center}
            placement={item.placement ?? 'bottom'}
            type={(item.type ?? '') as TimelineItemType}
            color={item.color ?? ''}
            size={item.size ?? 'normal'}
            icon={item.icon}
            hollow={item.hollow}>
            {{
              default: () => (slots.default as unknown as ((args: { item: TimelineItem; index: number }) => unknown) | undefined)?.({ item, index }) ?? item.content ?? null
            }}
          </ITimelineItem>
        ));
      const renderSlots = () => {
        if (!slots.default) return null;
        const children = flatten(slots.default() as VNode[]);
        return props.reverse ? [...children].reverse() : children;
      };
      return (
        <ul class={['i-timeline', `i-timeline--${props.mode}`]}>
          {props.items.length > 0 ? renderItems() : renderSlots()}
        </ul>
      );
    };
  }
});
