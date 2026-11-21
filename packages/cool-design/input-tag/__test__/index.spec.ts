import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import InputTag from '..';
import { h } from 'vue';
import Form from '../../form';

describe('test `InputTag` component', () => {
  test('trigger 按键把输入收为标签', async () => {
    const wrapper = mount(InputTag, { props: { modelValue: [] } });
    const input = wrapper.get('input');
    await input.setValue('苹果');
    expect(wrapper.emitted('input')).toEqual([['苹果']]);
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('add-tag')).toEqual([['苹果']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[[ '苹果' ]]]);
    expect(wrapper.emitted('change')).toEqual([[[ '苹果' ]]]);
    expect((input.element as HTMLInputElement).value).toBe('');
  });

  test('max 限制标签数量，Backspace 删除末尾标签', async () => {
    const wrapper = mount(InputTag, { props: { modelValue: ['a'], max: 2 } });
    const input = wrapper.get('input');
    await input.setValue('b');
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('add-tag')).toHaveLength(1);
    await input.setValue('c');
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('add-tag')).toHaveLength(1);

    await wrapper.setProps({ modelValue: ['a', 'b'] });
    await input.setValue('');
    await input.trigger('keydown', { key: 'Backspace' });
    expect(wrapper.emitted('remove-tag')).toEqual([['b']]);
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toEqual(['a']);
  });

  test('delimiter 匹配即收为标签，save-on-blur 失焦保存', async () => {
    const wrapper = mount(InputTag, { props: { modelValue: [], delimiter: ',' } });
    const input = wrapper.get('input');
    await input.setValue('苹果,香蕉');
    expect(wrapper.emitted('add-tag')).toEqual([['苹果']]);

    const blurWrapper = mount(InputTag, { props: { modelValue: [] } });
    const blurInput = blurWrapper.get('input');
    await blurInput.setValue('失焦保存');
    await blurInput.trigger('blur');
    expect(blurWrapper.emitted('add-tag')).toEqual([['失焦保存']]);
  });

  test('清空与折叠标签展示', async () => {
    const wrapper = mount(InputTag, {
      props: { modelValue: ['a', 'b', 'c'], clearable: true }
    });
    await wrapper.find('.i-input-tag__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[]]]);
    expect(wrapper.emitted('clear')).toHaveLength(1);

    const collapsed = mount(InputTag, {
      props: { modelValue: ['a', 'b', 'c'], collapseTags: true, maxCollapseTags: 1, collapseTagsTooltip: true }
    });
    expect(collapsed.findAll('.i-input-tag__tag')).toHaveLength(1);
    expect(collapsed.text()).toContain('+2');
    expect(collapsed.find('.i-input-tag__more').attributes('title')).toBeUndefined();
  });

  test('拖拽排序标签并触发 drag-tag', async () => {
    const wrapper = mount(InputTag, { props: { modelValue: ['a', 'b'], draggable: true } });
    const tags = wrapper.findAll('.i-input-tag__tag');
    await tags[0].trigger('dragstart');
    await tags[1].trigger('dragover');
    await tags[1].trigger('drop');
    expect(wrapper.emitted('drag-tag')).toEqual([['a']]);
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toEqual(['b', 'a']);
  });

  test('disabled 与 readonly 不可编辑', () => {
    const wrapper = mount(InputTag, { props: { modelValue: ['a'], disabled: true } });
    expect(wrapper.find('.i-input-tag__remove').exists()).toBe(false);
    expect((wrapper.get('input').element as HTMLInputElement).disabled).toBe(true);

    const readonly = mount(InputTag, { props: { modelValue: ['a'], readonly: true } });
    expect(readonly.find('.i-input-tag__remove').exists()).toBe(false);
    expect((readonly.get('input').element as HTMLInputElement).readOnly).toBe(true);
  });

  test('tag 插槽自定义标签内容', () => {
    const wrapper = mount(InputTag, {
      props: { modelValue: ['a'] },
      slots: { tag: ({ value }: { value: string }) => `自定义-${value}` }
    });
    expect(wrapper.text()).toContain('自定义-a');
  });
});

test('InputTag 直挂禁用 Form 时忽略键盘删除', () => {
  const wrapper = mount(Form, {
    props: { model: {}, disabled: true, size: 'small' },
    slots: { default: () => h(InputTag, { modelValue: ['苹果'], clearable: true }) }
  });
  const input = wrapper.getComponent(InputTag);
  input.get('input').element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
  expect(input.classes()).toContain('i-control--small');
  expect(input.get('input').attributes('disabled')).toBeDefined();
  expect(input.emitted('update:modelValue')).toBeUndefined();
  wrapper.unmount();
});

test('InputTag 禁用后拦截正在进行的拖拽与键盘添加', async () => {
  const wrapper = mount(Form, {
    props: { model: {} },
    slots: { default: () => h(InputTag, { modelValue: ['a', 'b'], draggable: true }) }
  });
  const control = wrapper.getComponent(InputTag);
  const tags = control.findAll('.i-input-tag__tag');
  await tags[0].trigger('dragstart');
  const input = control.get('input');
  input.element.value = 'c';
  input.element.dispatchEvent(new Event('input'));
  await wrapper.setProps({ disabled: true });
  await tags[1].trigger('drop');
  input.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(control.emitted('update:modelValue')).toBeUndefined();
  wrapper.unmount();
});

test('has independent folded tooltip effect and slot indexes', async () => {
  const wrapper = mount(InputTag, {
    props: { modelValue: ['a', 'b', 'c'], collapseTags: true, collapseTagsTooltip: true, effect: 'custom-theme', tagEffect: 'plain' },
    slots: { tag: ({ value, index }) => `${index}:${value}` }
  });
  expect(wrapper.get('.i-input-tag__tag').text()).toContain('0:a');
  await wrapper.get('.i-tooltip__trigger').trigger('mouseenter');
  const tooltip = document.body.querySelector('.i-tooltip--custom-theme');
  expect(tooltip?.textContent).toContain('1:b');
  expect(tooltip?.textContent).toContain('2:c');
  expect(tooltip?.querySelector('.is-plain')).toBeTruthy();
  (tooltip?.querySelector('button') as HTMLButtonElement).click();
  expect(wrapper.emitted('update:modelValue')).toEqual([[['a', 'c']]]);
  wrapper.unmount();
});
