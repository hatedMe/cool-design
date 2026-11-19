import { defineComponent, type Component, type PropType } from 'vue';
import Icon from '../icon';
import type { StepStatus } from './steps';

export default defineComponent({
  name: 'i-step',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: [String, Object] as PropType<string | Component>, default: '' },
    status: { type: String as PropType<StepStatus | ''>, default: '' }
  },
  setup(props, { slots }) {
    // 实际内容由 Steps 父组件统一渲染，此处仅兼容独立使用
    return () => (
      <div class='i-step'>
        <div class='i-step__icon'>
          {slots.icon?.() ?? (props.icon ? <Icon icon={props.icon} aria-hidden='true' /> : null)}
        </div>
        <div class='i-step__title'>{slots.title?.() ?? props.title}</div>
        <div class='i-step__description'>{slots.description?.() ?? props.description}</div>
      </div>
    );
  }
});
