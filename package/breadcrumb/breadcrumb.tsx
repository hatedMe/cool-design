import { defineComponent, type PropType } from 'vue';
export interface BreadcrumbItem {
  to?: string;
  label: string;
}
export default defineComponent({
  name: 'i-breadcrumb',
  props: {
    items: { type: Array as PropType<BreadcrumbItem[]>, default: () => [] },
    separator: { type: String, default: '/' }
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    return () => (
      <nav class='i-breadcrumb' aria-label='面包屑'>
        <ol>
          {props.items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              {item.to ? (
                <a href={item.to} onClick={(e) => emit('click', item, e)}>
                  {slots.default?.({ item, index }) ?? item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {index < props.items.length - 1 && <b>{props.separator}</b>}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
});
