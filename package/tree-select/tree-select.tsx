import { computed, defineComponent, ref, type PropType } from "vue";
export interface TreeSelectNode {
  value: string | number;
  label: string;
  children?: TreeSelectNode[];
  disabled?: boolean;
}
export default defineComponent({
  name: "i-tree-select",
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[] | null>,
      default: null
    },
    data: { type: Array as PropType<TreeSelectNode[]>, default: () => [] },
    multiple: Boolean,
    checkStrictly: Boolean,
    filterable: Boolean,
    placeholder: { type: String, default: "请选择" },
    disabled: Boolean,
    clearable: Boolean
  },
  emits: ["update:modelValue", "change", "clear", "visible-change"],
  setup(props, { emit }) {
    const open = ref(false);
    const query = ref("");
    const selected = computed(() =>
      Array.isArray(props.modelValue) ? props.modelValue : props.modelValue == null ? [] : [props.modelValue]
    );
    const matches = (node: TreeSelectNode) =>
      !query.value || node.label.toLowerCase().includes(query.value.toLowerCase());
    const toggle = (value: string | number) => {
      let next: (string | number)[] = props.multiple ? [...selected.value] : [];
      if (props.multiple) next = next.includes(value) ? next.filter((item) => item !== value) : [...next, value];
      else next = [value];
      const result = props.multiple ? next : next[0] ?? null;
      emit("update:modelValue", result);
      emit("change", result);
      if (!props.multiple) open.value = false;
    };
    const render = (nodes: TreeSelectNode[]): unknown[] =>
      nodes.flatMap((node) => [
        matches(node) && (
          <label key={String(node.value)} class="i-tree-select__node">
            <input
              type={props.multiple ? "checkbox" : "radio"}
              checked={selected.value.includes(node.value)}
              disabled={props.disabled || node.disabled}
              onChange={() => toggle(node.value)}
            />
            {node.label}
          </label>
        ),
        node.children ? (
          <div class="i-tree-select__children" key={`${node.value}-children`}>
            {render(node.children)}
          </div>
        ) : null
      ]);
    return () => (
      <span class="i-tree-select">
        <button
          type="button"
          class="i-tree-select__control"
          disabled={props.disabled}
          onClick={() => {
            open.value = !open.value;
            emit("visible-change", open.value);
          }}>
          {selected.value.length ? selected.value.join(", ") : props.placeholder}
        </button>
        {props.clearable && selected.value.length > 0 && (
          <button
            type="button"
            class="i-tree-select__clear"
            onClick={() => {
              emit("update:modelValue", props.multiple ? [] : null);
              emit("clear");
            }}>
            ×
          </button>
        )}
        {open.value && (
          <div class="i-tree-select__dropdown">
            {props.filterable && (
              <input
                value={query.value}
                placeholder="筛选"
                onInput={(e: Event) => (query.value = (e.target as HTMLInputElement).value)}
              />
            )}
            {render(props.data)}
          </div>
        )}
      </span>
    );
  }
});
