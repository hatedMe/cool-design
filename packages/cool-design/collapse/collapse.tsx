import { computed, defineComponent, provide, ref, type PropType } from 'vue';
import { collapseKey, type CollapseBeforeCollapse, type CollapseIconPosition, type CollapseName } from './context';

const toArray = (value: CollapseName | CollapseName[] | undefined): CollapseName[] =>
  value === undefined ? [] : Array.isArray(value) ? [...value] : [value];

export default defineComponent({
  name: 'i-collapse',
  props: {
    modelValue: { type: [String, Number, Array] as PropType<CollapseName | CollapseName[]>, default: undefined },
    accordion: Boolean,
    expandIconPosition: { type: String as PropType<CollapseIconPosition>, default: 'right' },
    beforeCollapse: { type: Function as PropType<CollapseBeforeCollapse>, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { slots, emit, expose }) {
    const root = ref<HTMLElement>();
    const internal = ref<CollapseName[]>(toArray(props.modelValue));
    const controlled = computed(() => props.modelValue !== undefined);
    const activeNames = computed(() => (controlled.value ? toArray(props.modelValue) : internal.value));
    const order: symbol[] = [];
    let seq = 0;

    const apply = (next: CollapseName[]) => {
      const normalized = props.accordion ? next.slice(0, 1) : next;
      if (!controlled.value) internal.value = normalized;
      const value = props.accordion ? normalized[0] : [...normalized];
      emit('update:modelValue', value);
      emit('change', value);
    };
    const toggle = async (name: CollapseName) => {
      const current = activeNames.value;
      const next = props.accordion
        ? current.includes(name)
          ? []
          : [name]
        : current.includes(name)
          ? current.filter((item) => item !== name)
          : [...current, name];
      const ticket = ++seq;
      if (props.beforeCollapse) {
        const result = await props.beforeCollapse([...next], name);
        if (ticket !== seq) return;
        if (result === false) return;
      }
      apply(next);
    };
    const setActiveNames = (names: CollapseName | CollapseName[]) => apply(toArray(names));

    provide(collapseKey, {
      activeNames,
      toggle,
      register: (uid: symbol) => {
        order.push(uid);
        return order.length - 1;
      },
      unregister: (uid: symbol) => {
        const index = order.indexOf(uid);
        if (index >= 0) order.splice(index, 1);
      },
      expandIconPosition: computed(() => props.expandIconPosition)
    });
    expose({ activeNames, setActiveNames });

    const onKeydown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const headers = Array.from(
        root.value?.querySelectorAll<HTMLButtonElement>('.i-collapse-item__header:not(:disabled)') || []
      );
      const index = headers.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0) return;
      event.preventDefault();
      const target =
        event.key === 'ArrowDown'
          ? headers[index + 1] ?? headers[0]
          : event.key === 'ArrowUp'
            ? headers[index - 1] ?? headers[headers.length - 1]
            : event.key === 'Home'
              ? headers[0]
              : headers[headers.length - 1];
      target?.focus();
    };

    return () => (
      <div ref={root} class='i-collapse' onKeydown={onKeydown}>
        {slots.default?.()}
      </div>
    );
  }
});
