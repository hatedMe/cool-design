import { computed, defineComponent, h, inject, type PropType } from "vue";
import { rowKeys } from "../row/row";
import type { ColSize } from "./types";
const responsive = { type: [Number, Object] as PropType<ColSize>, default: undefined };
const units = (value: number) => Math.max(0, Math.min(24, Math.trunc(value)));
export default defineComponent({
  name: "i-col",
  props: {
    span: { type: Number, default: 24 },
    tag: { type: String, default: "div" },
    offset: { type: Number, default: 0 },
    pull: { type: Number, default: 0 },
    push: { type: Number, default: 0 },
    xs: responsive,
    sm: responsive,
    md: responsive,
    lg: responsive,
    xl: responsive
  },
  setup(props, { slots }) {
    const { gutter } = inject(rowKeys, { gutter: computed(() => 0) });
    return () => {
      const classes = [
        "i-col",
        `i-col-${units(props.span)}`,
        `i-col-offset-${units(props.offset)}`,
        `i-col-push-${units(props.push)}`,
        `i-col-pull-${units(props.pull)}`
      ];
      for (const breakpoint of ["xs", "sm", "md", "lg", "xl"] as const) {
        const value = props[breakpoint];
        if (value === undefined) continue;
        const values = typeof value === "number" ? { span: value } : value;
        for (const key of ["span", "offset", "push", "pull"] as const) {
          const amount = values[key];
          if (amount !== undefined)
            classes.push(`i-col-${breakpoint}-${key === "span" ? "" : `${key}-`}${units(amount)}`);
        }
      }
      return h(
        props.tag,
        {
          class: classes,
          style: { paddingLeft: `${gutter.value / 2}px`, paddingRight: `${gutter.value / 2}px` }
        },
        slots.default?.()
      );
    };
  }
});
