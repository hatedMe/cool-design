import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import InputNumber from '../index';

describe('InputNumber', () => {
  test('支持标准 v-model、默认步长和手动输入', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 2 } });
    expect(wrapper.get('input').element.value).toBe('2');
    await wrapper.get('[aria-label="增加"] ').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3]);
    await wrapper.get('input').setValue('8');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([8]);
  });

  test('按 min、max、step 和 precision 约束数值', async () => {
    const wrapper = mount(InputNumber, {
      props: { modelValue: 1, min: 0, max: 2, step: 0.1, precision: 2 }
    });
    await wrapper.get('[aria-label="增加"] ').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.1]);
    await wrapper.get('input').setValue('3.456');
    await wrapper.get('input').trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2]);
  });

  test('step-strictly 按 min 对齐步长', async () => {
    const wrapper = mount(InputNumber, {
      props: { modelValue: 3, min: 3, max: 15, step: 4, stepStrictly: true }
    });
    await wrapper.get('input').setValue('8');
    await wrapper.get('input').trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([7]);
  });

  test('支持 controls、readonly、禁用状态和前后缀插槽', async () => {
    const wrapper = mount(InputNumber, {
      props: { modelValue: 1, controls: false, readonly: true },
      slots: { prefix: '¥', suffix: '元' }
    });
    expect(wrapper.find('[aria-label="增加"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('¥');
    expect(wrapper.text()).toContain('元');
    await wrapper.get('input').setValue('2');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('支持键盘方向键、focus、blur 和实例方法', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 1 } });
    await wrapper.get('input').trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2]);
    await wrapper.get('input').trigger('focus');
    await wrapper.get('input').trigger('blur');
    expect(wrapper.emitted('focus')).toHaveLength(1);
    expect(wrapper.emitted('blur')).toHaveLength(1);
    const instance = wrapper.vm as unknown as { focus: () => void; blur: () => void };
    expect(() => instance.focus()).not.toThrow();
    expect(() => instance.blur()).not.toThrow();
  });
});
