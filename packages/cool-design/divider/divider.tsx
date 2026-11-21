import { defineComponent, type PropType } from 'vue';

export type DividerDirection = 'horizontal' | 'vertical';
export type DividerContentPosition = 'left' | 'center' | 'right';
export type DividerBorderStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
  | 'none'
  | 'hidden'
  | (string & {});

export default defineComponent({
  name: 'i-divider',
  props: {
    vertical: Boolean,
    direction: { type: String as PropType<DividerDirection>, default: 'horizontal' },
    contentPosition: { type: String as PropType<DividerContentPosition>, default: 'center' },
    borderStyle: { type: String as PropType<DividerBorderStyle>, default: 'solid' }
  },
  setup(props, { slots }) {
    const isVertical = () => props.vertical || props.direction === 'vertical';
    return () => {
      const vertical = isVertical();
      return (
        <div
          role='separator'
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          class={[
            'i-divider',
            vertical ? 'i-divider--vertical' : 'i-divider--horizontal',
            `i-divider--${props.contentPosition}`
          ]}
          style={{ '--i-divider-border-style': props.borderStyle } as Record<string, string>}>
          {!vertical && slots.default && (
            <div class={['i-divider__text', `is-${props.contentPosition}`]}>{slots.default()}</div>
          )}
        </div>
      );
    };
  }
});
