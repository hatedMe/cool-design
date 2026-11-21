import { defineComponent, provide, ref, type PropType } from 'vue';
import { breadcrumbKey } from './context';
import IBreadcrumbItem, { type BreadcrumbTo } from './breadcrumb-item';

export interface BreadcrumbItem {
  to?: BreadcrumbTo;
  label: string;
  replace?: boolean;
}

export default defineComponent({
  name: 'i-breadcrumb',
  props: {
    items: { type: Array as PropType<BreadcrumbItem[]>, default: () => [] },
    separator: { type: String, default: '/' },
    separatorIcon: { type: [String, Object] as PropType<string | Record<string, unknown>>, default: undefined }
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    const order = ref<number[]>([]);

    const register = (uid: number) => {
      if (!order.value.includes(uid)) order.value.push(uid);
    };
    const unregister = (uid: number) => {
      order.value = order.value.filter((id) => id !== uid);
    };
    const isLast = (uid: number) => {
      if (order.value.length === 0) return false;
      return order.value[order.value.length - 1] === uid;
    };

    provide(breadcrumbKey, {
      get separator() {
        return props.separator;
      },
      get separatorIcon() {
        return props.separatorIcon;
      },
      get separatorSlot() {
        return slots.separator;
      },
      register,
      unregister,
      isLast,
      items: order
    });

    return () => {
      const useSlotChildren = !!slots.default && props.items.length === 0;
      return (
        <nav class='i-breadcrumb' aria-label='面包屑'>
          <ol class='i-breadcrumb__list'>
            {useSlotChildren
              ? slots.default?.()
              : props.items.map((item, index) => (
                  <IBreadcrumbItem
                    key={`${item.label}-${index}`}
                    to={item.to}
                    replace={item.replace}
                    onClick={(event: MouseEvent) => emit('click', item, event)}>
                    {{
                      default: () => slots.default?.({ item, index } as never) ?? item.label
                    }}
                  </IBreadcrumbItem>
                ))}
          </ol>
        </nav>
      );
    };
  }
});
