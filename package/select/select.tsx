import { defineComponent, nextTick, ref, type PropType, type VNode } from "vue";
import { useField } from "../form/context";
import { useConfig, type Size } from "../config-provider/context";
export interface SelectRemoteOption {
  value: string | number;
  label?: string;
  disabled?: boolean;
}
export default defineComponent({
  name: "i-select",
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Array] as PropType<string | number | Array<string | number> | undefined>,
    clearable: Boolean,
    disabled: Boolean,
    placeholder: { type: String, default: "请选择" },
    size: String as PropType<Size>,
    multiple: Boolean,
    name: String,
    filterable: Boolean,
    noDataText: { type: String, default: "暂无数据" },
    noMatchText: { type: String, default: "无匹配数据" },
    remote: Boolean,
    remoteMethod: Function as PropType<(query: string) => SelectRemoteOption[] | Promise<SelectRemoteOption[]>>,
    remoteLoading: Boolean,
    virtualized: Boolean,
    itemHeight: { type: Number, default: 34 },
    height: { type: Number, default: 240 }
  },
  emits: ["update:modelValue", "change", "blur"],
  setup(props, { slots, attrs, emit, expose }) {
    const field = useField();
    const config = useConfig();
    const select = ref<HTMLSelectElement>();
    const query = ref("");
    const remoteOptions = ref<SelectRemoteOption[]>([]);
    const remoteOffset = ref(0);
    const loadRemote = async (value: string) => {
      query.value = value;
      remoteOffset.value = 0;
      if (props.remote && props.remoteMethod) remoteOptions.value = await props.remoteMethod(value);
    };
    expose({ focus: () => select.value?.focus() });
    const update = (value: string | number | Array<string | number> | undefined) => {
      emit("update:modelValue", value);
      emit("change", value);
      nextTick(() => field?.validate("change"));
    };
    return () => {
      const options = props.remote
        ? remoteOptions.value.map((option) => (
            <option value={option.value} disabled={option.disabled} key={option.value}>
              {option.label ?? option.value}
            </option>
          ))
        : slots.default?.() ?? [];
      const filtered =
        props.remote || !props.filterable || !query.value
          ? options
          : options.filter((option) =>
              String((option as VNode).props?.label ?? (option as VNode).children ?? "").includes(query.value)
            );
      const visible =
        props.virtualized && filtered.length
          ? filtered.slice(remoteOffset.value, remoteOffset.value + Math.ceil(props.height / props.itemHeight) + 4)
          : filtered;
      return (
        <span class={["i-select", `i-control--${props.size || config.value.size}`]}>
          {(props.filterable || props.remote) && (
            <input
              aria-label="筛选选项"
              value={query.value}
              onInput={(event: Event) => loadRemote((event.target as HTMLInputElement).value)}
            />
          )}
          <select
            {...attrs}
            id={(attrs.id as string) || field?.id}
            ref={select}
            value={props.multiple ? props.modelValue ?? [] : props.modelValue ?? ""}
            multiple={props.multiple}
            style={props.virtualized ? { maxHeight: `${props.height}px` } : undefined}
            onScroll={(event: Event) => {
              if (props.virtualized)
                remoteOffset.value = Math.floor((event.target as HTMLSelectElement).scrollTop / props.itemHeight);
            }}
            name={props.name}
            disabled={props.disabled || field?.disabled?.()}
            aria-invalid={field?.invalid() || undefined}
            aria-describedby={field?.invalid() ? field.errorId : undefined}
            onChange={(event: Event) => {
              if (props.disabled) return;
              const selected = [...(event.target as HTMLSelectElement).selectedOptions] as (HTMLOptionElement & {
                _value?: string | number;
              })[];
              const resolveValue = (option: HTMLOptionElement & { _value?: string | number }) =>
                option._value ??
                remoteOptions.value.find((item) => String(item.value) === option.value)?.value ??
                option.value;
              if (props.multiple) update(selected.map(resolveValue));
              else {
                const option = selected[0];
                update(!option || option.value === "" ? undefined : resolveValue(option));
              }
            }}
            onBlur={(event: FocusEvent) => {
              field?.validate("blur");
              emit("blur", event);
            }}>
            <option value="" disabled={!props.clearable}>
              {props.placeholder}
            </option>
            {visible}
          </select>
          {props.remoteLoading && <span class="i-select__empty">加载中…</span>}
          {!props.remote && props.filterable && query.value && !filtered.length && (
            <span class="i-select__empty">{props.noMatchText}</span>
          )}
          {!props.remote && !props.filterable && !filtered.length && (
            <span class="i-select__empty">{props.noDataText}</span>
          )}
          {props.clearable &&
            props.modelValue !== undefined &&
            (!props.multiple || (props.modelValue as Array<unknown>).length > 0) && (
              <button
                type="button"
                aria-label="清空"
                disabled={props.disabled || field?.disabled?.()}
                onClick={() => {
                  if (!props.disabled) {
                    update(undefined);
                    select.value?.focus();
                  }
                }}>
                ×
              </button>
            )}
        </span>
      );
    };
  }
});
