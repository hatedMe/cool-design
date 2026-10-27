import { Teleport, defineComponent, type PropType } from 'vue';
export default defineComponent({
  name: 'i-drawer',
  props: {
    modelValue: Boolean,
    title: String,
    direction: { type: String as PropType<'rtl' | 'ltr' | 'ttb' | 'btt'>, default: 'rtl' },
    size: { type: [String, Number] as PropType<string | number>, default: '30%' },
    withHeader: { type: Boolean, default: true },
    closeOnClickModal: { type: Boolean, default: true },
    closeOnPressEscape: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'open', 'close'],
  setup(props, { slots, emit }) {
    const close = () => emit('update:modelValue', false);
    return () =>
      !props.modelValue ? null : (
        <Teleport to='body'>
          <div
            class='i-drawer__mask'
            onClick={(e: MouseEvent) => {
              if (e.target === e.currentTarget && props.closeOnClickModal) close();
            }}>
            <aside
              class={['i-drawer', `is-${props.direction}`]}
              style={{
                ['--i-drawer-size' as string]: typeof props.size === 'number' ? `${props.size}px` : props.size
              }}
              role='dialog'>
              {props.withHeader && (
                <header>
                  <strong>{slots.title?.() ?? props.title}</strong>
                  {props.showClose && (
                    <button type='button' aria-label='关闭' onClick={close}>
                      ×
                    </button>
                  )}
                </header>
              )}
              <div class='i-drawer__body'>{slots.default?.()}</div>
              {slots.footer && <footer>{slots.footer()}</footer>}
            </aside>
          </div>
        </Teleport>
      );
  }
});
