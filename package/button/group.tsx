import { defineComponent, provide, type InjectionKey, type PropType } from "vue";
import type { ButtonSize, ButtonType } from "./types";

export interface ButtonGroupContext {
  type?: ButtonType;
  size?: ButtonSize;
}
export const buttonGroupKey: InjectionKey<ButtonGroupContext> = Symbol("button-group");

export default defineComponent({
  name: "i-button-group",
  props: {
    type: String as PropType<ButtonType>,
    size: String as PropType<ButtonSize>,
    direction: { type: String as PropType<"horizontal" | "vertical">, default: "horizontal" }
  },
  setup(props, { slots }) {
    provide(buttonGroupKey, props);
    return () => (
      <div class={["i-button-group", `i-button-group--${props.direction}`]} role="group">
        {slots.default?.()}
      </div>
    );
  }
});
