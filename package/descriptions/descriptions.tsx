import { defineComponent, type PropType } from "vue";
export interface DescriptionItem {
  label: string;
  content?: unknown;
  span?: number;
}
export default defineComponent({
  name: "i-descriptions",
  props: {
    title: String,
    border: Boolean,
    column: { type: Number, default: 3 },
    direction: { type: String as PropType<"horizontal" | "vertical">, default: "horizontal" },
    items: { type: Array as PropType<DescriptionItem[]>, default: () => [] }
  },
  setup(props, { slots }) {
    return () => (
      <section class={{ "i-descriptions": true, "is-bordered": props.border, [`is-${props.direction}`]: true }}>
        <header>{slots.title?.() ?? props.title}</header>
        <div class="i-descriptions__grid" style={{ gridTemplateColumns: `repeat(${props.column}, minmax(0, 1fr))` }}>
          {props.items.map((item, index) => (
            <div class="i-descriptions__item" key={item.label}>
              <strong>{item.label}</strong>
              <span>
                {slots[`label-${index}`]?.()}
                {slots[`content-${index}`]?.() ?? item.content}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }
});
