import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  type Component,
  type CSSProperties,
  type PropType,
  type Slot,
  type VNode
} from 'vue';
import Icon from '../icon';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error' | 'success';
export type StepsDirection = 'horizontal' | 'vertical';

export interface StepItem {
  title: string;
  description?: string;
  icon?: string | Component;
  status?: StepStatus | '';
}

interface NormalizedStep {
  title: string;
  description: string;
  icon: string | Component | undefined;
  status: StepStatus | '';
  titleSlot?: Slot;
  descriptionSlot?: Slot;
  iconSlot?: Slot;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isStepVNode = (node: VNode): boolean => (node.type as any)?.name === 'i-step';

const toCssSize = (value: string | number | undefined): string | undefined => {
  if (value === undefined || value === '') return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export default defineComponent({
  name: 'i-steps',
  props: {
    active: { type: Number, default: 0 },
    items: { type: Array as PropType<StepItem[]>, default: () => [] },
    direction: { type: String as PropType<StepsDirection>, default: 'horizontal' },
    finishStatus: { type: String as PropType<StepStatus>, default: 'finish' },
    processStatus: { type: String as PropType<StepStatus>, default: 'process' },
    alignCenter: Boolean,
    simple: Boolean,
    space: { type: [String, Number] as PropType<string | number>, default: undefined }
  },
  emits: ['change'],
  setup(props, { emit, slots }) {
    const normalized = computed<NormalizedStep[]>(() => {
      const children = flatten(((slots.default?.() ?? []) as VNode[]).filter(Boolean)).filter(isStepVNode);
      if (children.length > 0) {
        return children.map((node) => {
          const nodeProps = (node.props ?? {}) as Record<string, unknown>;
          const nodeSlots = node.children as unknown as Record<string, Slot | undefined>;
          const getSlot = (slotName: string): Slot | undefined => {
            const slot = nodeSlots?.[slotName];
            return typeof slot === 'function' ? slot : undefined;
          };
          return {
            title: (nodeProps.title as string) ?? '',
            description: (nodeProps.description as string) ?? '',
            icon: nodeProps.icon as string | Component | undefined,
            status: ((nodeProps.status as StepStatus) ?? '') as StepStatus | '',
            titleSlot: getSlot('title'),
            descriptionSlot: getSlot('description'),
            iconSlot: getSlot('icon')
          };
        });
      }
      return props.items.map((item, index) => ({
        title: item.title,
        description: item.description ?? '',
        icon: item.icon,
        status: item.status ?? '',
        titleSlot: (slots as unknown as Record<string, Slot | undefined>)[`title-${index}`],
        descriptionSlot: undefined,
        iconSlot: undefined
      }));
    });

    const resolveStatus = (step: NormalizedStep, index: number): StepStatus => {
      if (step.status) return step.status;
      if (index < props.active) return props.finishStatus;
      if (index === props.active) return props.processStatus;
      return 'wait';
    };

    return () => {
      const steps = normalized.value;
      const spaceSize = toCssSize(props.space);
      return (
        <div
          class={{
            'i-steps': true,
            [`is-${props.direction}`]: true,
            'is-center': props.alignCenter,
            'is-simple': props.simple
          }}
          role='list'>
          {steps.map((step, index) => {
            const status = resolveStatus(step, index);
            const isLast = index === steps.length - 1;
            const itemStyle: CSSProperties = {};
            if (spaceSize) {
              if (props.direction === 'horizontal') itemStyle.width = spaceSize;
              else itemStyle.height = spaceSize;
            }
            return (
              <div
                class={{
                  'i-steps__item': true,
                  [`is-${status}`]: true,
                  'is-last': isLast,
                  'is-center': props.alignCenter,
                  'is-simple': props.simple
                }}
                style={itemStyle}
                role='listitem'
                aria-current={index === props.active ? 'step' : undefined}
                key={`${step.title}-${index}`}
                tabindex={0}
                onClick={() => emit('change', index)}
                onKeydown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    emit('change', index);
                  }
                }}>
                <div class='i-steps__head'>
                  <div class='i-steps__icon'>
                    {step.iconSlot?.()
                      ?? (step.icon ? (
                          <Icon icon={step.icon} aria-hidden='true' />
                        ) : status === 'finish' || status === 'success' ? (
                          <span aria-hidden='true'>✓</span>
                        ) : status === 'error' ? (
                          <span aria-hidden='true'>✕</span>
                        ) : (
                          (props.simple ? null : index + 1)
                        ))}
                  </div>
                  {!isLast && <div class='i-steps__line' aria-hidden='true' />}
                </div>
                <div class='i-steps__main'>
                  <div class='i-steps__title'>{step.titleSlot?.() ?? step.title}</div>
                  {!props.simple && (step.descriptionSlot?.() || step.description) && (
                    <div class='i-steps__description'>{step.descriptionSlot?.() ?? step.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };
  }
});
