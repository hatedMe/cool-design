import { computed, defineComponent } from "vue";
import type { PropType } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("badge");

export type Type = "primary" | "success" | "warning" | "danger" | "info";

const props = {
  value: {
    type: [String, Number] as PropType<string | number>,
    default: ""
  },
  /** @description 最大值 */
  max: {
    type: Number as PropType<number>,
    default: 99
  },
  type: {
    type: String as PropType<Type>,
    default: "warning"
  },
  isDot: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  hidden: Boolean,
  showZero: Boolean,
  offset: {
    type: Array as unknown as PropType<[number, number]>,
    default: undefined
  },
  color: String
};

const isNumber = (value: unknown): boolean => typeof value === "number";

export default defineComponent({
  name,
  props,
  setup(props, { slots }) {
    const content = computed<string>(() => {
      const { max, value, isDot } = props;
      if (isDot) return "";
      if (isNumber(value) && isNumber(max)) {
        return max < Number(value) ? `${max}+` : `${value}`;
      }
      return `${value}`;
    });

    return () => (
      <div class={bem()}>
        {slots.default?.()}
        {!props.hidden && (props.isDot || (props.value !== "" && (props.showZero || props.value !== 0))) && (
          <span
            class={[bem("tag", { [props.type]: true }), props.isDot && bem("dot")]}
            style={{
              background: props.color,
              "--i-badge-offset-x": props.offset ? `${props.offset[0]}px` : undefined,
              "--i-badge-offset-y": props.offset ? `${props.offset[1]}px` : undefined
            }}
            data-offset={props.offset?.join(",")}>
            {content.value}
          </span>
        )}
      </div>
    );
  }
});
