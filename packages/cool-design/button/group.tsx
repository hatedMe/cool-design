import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, provide, type InjectionKey, type PropType } from 'vue';
import type { ButtonSize, ButtonType, ButtonGroupDirection } from './types';
export type { ButtonGroupDirection } from './types';

export interface ButtonGroupContext {
  type?: ButtonType;
  size?: ButtonSize;
}
export const buttonGroupKey: InjectionKey<ButtonGroupContext> = Symbol('button-group');

export default defineComponent({
  name: 'i-button-group',
  props: {
    type: String as PropType<ButtonType>,
    size: String as PropType<ButtonSize>,
    direction: { type: String as PropType<ButtonGroupDirection>, default: 'horizontal' }
  },
  setup(props, { slots }) {
    const ns = useNamespace('button-group');
    provide(buttonGroupKey, props);
    return () => (
      <div class={[ns.b(), ns.m(props.direction)]} role='group'>
        {slots.default?.()}
      </div>
    );
  }
});
