import { Comment, Fragment, Text, computed, defineComponent, ref, type PropType, type VNode } from 'vue';

export interface SegmentedOption {
  label?: string;
  value: string | number;
  disabled?: boolean;
}
export type SegmentedValue = string | number;
export type SegmentedRawOption = string | number | SegmentedOption;

interface RenderableOption extends SegmentedOption {
  vnode?: VNode;
}

// 展平片段并过滤注释、文本空节点，仅保留可映射为选项的元素。
const flattenSlot = (vnodes: VNode[]): VNode[] =>
  vnodes.flatMap((vnode) =>
    vnode.type === Fragment && Array.isArray(vnode.children)
      ? flattenSlot(vnode.children as VNode[])
      : [vnode]
  ).filter((vnode) => vnode.type !== Comment && vnode.type !== Text);

export default defineComponent({
  name: 'i-segmented',
  props: {
    options: { type: Array as PropType<SegmentedRawOption[]>, default: () => [] },
    modelValue: [String, Number] as PropType<SegmentedValue>,
    disabled: Boolean,
    block: Boolean,
    size: String as PropType<'large' | 'default' | 'small'>
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const focusedValue = ref<SegmentedValue>();
    const normalized = computed<SegmentedOption[]>(() =>
      props.options.map((option) =>
        typeof option === 'object' && option !== null
          ? option
          : { value: option, label: String(option) }
      )
    );
    // 默认插槽的元素可映射为选项：取元素的 value 属性作为值，元素本身作为内容。
    const slotOptions = computed<RenderableOption[]>(() =>
      flattenSlot(slots.default?.() ?? []).map((vnode, index) => {
        const data = (vnode.props ?? {}) as Record<string, unknown>;
        return {
          value: (data.value as SegmentedValue | undefined) ?? index,
          label: data.label as string | undefined,
          disabled: Boolean(data.disabled),
          vnode
        };
      })
    );
    const items = computed<RenderableOption[]>(() =>
      props.options.length ? normalized.value : slotOptions.value
    );
    const select = (option: SegmentedOption) => {
      if (props.disabled || option.disabled || option.value === props.modelValue) return;
      emit('update:modelValue', option.value);
      emit('change', option.value);
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      const list = items.value;
      if (!list.length) return;
      const current = list.findIndex((item) => item.value === (focusedValue.value ?? props.modelValue));
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        for (let step = 1; step <= list.length; step++) {
          const candidate = list[(current + step + list.length) % list.length];
          if (!candidate.disabled) {
            focusedValue.value = candidate.value;
            select(candidate);
            break;
          }
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        for (let step = 1; step <= list.length; step++) {
          const candidate = list[(current - step + list.length * 2) % list.length];
          if (!candidate.disabled) {
            focusedValue.value = candidate.value;
            select(candidate);
            break;
          }
        }
      }
    };
    return () => (
      <div
        class={[
          'i-segmented',
          props.block && 'i-segmented--block',
          props.size && `i-segmented--${props.size}`,
          props.disabled && 'is-disabled'
        ]}
        role='radiogroup'
        aria-disabled={props.disabled || undefined}
        onKeydown={onKeydown}>
        {items.value.map((option) => {
          const selected = option.value === props.modelValue;
          return (
            <button
              key={String(option.value)}
              type='button'
              role='radio'
              aria-checked={selected}
              tabindex={selected || (props.modelValue === undefined && focusedValue.value === option.value) ? 0 : -1}
              class={['i-segmented__item', { 'is-selected': selected, 'is-disabled': option.disabled }]}
              disabled={props.disabled || option.disabled}
              onClick={() => {
                focusedValue.value = option.value;
                select(option);
              }}>
              {option.vnode ?? option.label ?? String(option.value)}
            </button>
          );
        })}
      </div>
    );
  }
});
