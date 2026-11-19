import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import Autocomplete from '..';
import Form from '../../form';
import FormItem from '../../form-item';

describe('test `Autocomplete` component', () => {
  test('输入过滤建议并点击选中', async () => {
    const wrapper = mount(Autocomplete, {
      props: { suggestions: ['Apple', 'Banana', 'Cherry'] }
    });
    const input = wrapper.get('input');
    await input.trigger('focus');
    await input.setValue('a');
    expect(wrapper.findAll('li').map((item) => item.text())).toEqual(['Apple', 'Banana']);
    await wrapper.findAll('li')[0].trigger('mousedown');
    expect(wrapper.emitted('select')![0][0]).toEqual({ value: 'Apple' });
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toBe('Apple');
  });

  test('键盘上下移动高亮，Enter 选中', async () => {
    const wrapper = mount(Autocomplete, {
      props: { modelValue: 'a', suggestions: ['Apple', 'Banana'] }
    });
    const input = wrapper.get('input');
    await input.trigger('focus');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')![0][0]).toEqual({ value: 'Apple' });
  });

  test('highlightFirstItem 默认高亮首项，selectWhenUnmatched 支持回车自定义', async () => {
    const wrapper = mount(Autocomplete, {
      props: { suggestions: ['Apple'], highlightFirstItem: true, selectWhenUnmatched: true, modelValue: '' }
    });
    const input = wrapper.get('input');
    await input.trigger('focus');
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')![0][0]).toEqual({ value: 'Apple' });

    await wrapper.setProps({ modelValue: 'Mango', highlightFirstItem: false, suggestions: [] });
    await input.trigger('focus');
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')![1][0]).toEqual({ value: 'Mango' });
  });

  test('fetchSuggestions 显示加载态，hideLoading 可关闭', async () => {
    const fetchSuggestions = vi.fn((_query: string, cb: (items: { value: string }[]) => void) => cb([]));
    const wrapper = mount(Autocomplete, {
      props: { fetchSuggestions }
    });
    await wrapper.get('input').trigger('focus');
    await flushPromises();
    expect(fetchSuggestions).toHaveBeenCalled();
    expect(wrapper.find('.i-autocomplete__loading').exists()).toBe(false);

    const pending = mount(Autocomplete, {
      props: { fetchSuggestions: vi.fn(() => undefined) }
    });
    await pending.get('input').trigger('focus');
    expect(pending.find('.i-autocomplete__loading').exists()).toBe(true);

    const hidden = mount(Autocomplete, {
      props: { fetchSuggestions: vi.fn(() => undefined), hideLoading: true }
    });
    await hidden.get('input').trigger('focus');
    expect(hidden.find('.i-autocomplete__loading').exists()).toBe(false);
  });

  test('debounce 防抖远程请求，连续输入只发起最后一次', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const fetchSuggestions = vi.fn((q: string, cb: (items: { value: string }[]) => void) => cb([{ value: q }]));
    const wrapper = mount(Autocomplete, { props: { fetchSuggestions, debounce: 200 } });
    const input = wrapper.get('input');
    await input.trigger('focus');
    // 聚焦触发的请求不走防抖。
    expect(fetchSuggestions).toHaveBeenCalledTimes(1);
    await input.setValue('a');
    vi.advanceTimersByTime(199);
    expect(fetchSuggestions).toHaveBeenCalledTimes(1);
    await input.setValue('ab');
    vi.advanceTimersByTime(1);
    // 原 'a' 的定时器已被取消：到达原定时刻也不发起请求。
    expect(fetchSuggestions).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(199);
    expect(fetchSuggestions).toHaveBeenCalledTimes(2);
    expect(fetchSuggestions).toHaveBeenLastCalledWith('ab', expect.any(Function));
    await flushPromises();
    expect(wrapper.findAll('li').map((li) => li.text())).toEqual(['ab']);
    vi.useRealTimers();
  });

  test('过期响应被丢弃，仅采纳最后一次请求的结果', async () => {
    const callbacks: ((items: { value: string }[]) => void)[] = [];
    const wrapper = mount(Autocomplete, {
      props: {
        debounce: 0,
        fetchSuggestions: (_q: string, cb: (items: { value: string }[]) => void) => {
          callbacks.push(cb);
        }
      }
    });
    const input = wrapper.get('input');
    await input.trigger('focus');
    await input.setValue('a');
    await input.setValue('ab');
    callbacks[2]([{ value: 'ab-result' }]);
    callbacks[0]([{ value: 'stale-result' }]);
    await flushPromises();
    expect(wrapper.findAll('li').map((li) => li.text())).toEqual(['ab-result']);
  });

  test('暴露 focus、blur、select、handleSelect', async () => {
    const wrapper = mount(Autocomplete, {
      props: { suggestions: ['Apple'] },
      attachTo: document.body
    });
    const api = wrapper.vm as unknown as {
      focus: () => void;
      blur: () => void;
      select: () => void;
      handleSelect: (item: { value: string }) => void;
    };
    api.focus();
    await flushPromises();
    expect(document.activeElement).toBe(wrapper.get('input').element);
    api.blur();
    api.select();
    api.handleSelect({ value: 'Apple' });
    expect(wrapper.emitted('select')![0][0]).toEqual({ value: 'Apple' });
    wrapper.unmount();
  });

  test('接入表单校验，blur 触发校验并可关闭', async () => {
    const model = reactive({ name: '' });
    const wrapper = mount(Form, {
      props: { model, rules: { name: [{ required: true, message: '名称必填' }] } },
      slots: {
        default: () =>
          h(
            FormItem,
            { prop: 'name', label: '名称' },
            () =>
              h(Autocomplete, {
                modelValue: model.name,
                suggestions: ['Apple'],
                'onUpdate:modelValue': (v: string) => (model.name = v)
              })
          )
      }
    });
    await wrapper.get('input').trigger('focus');
    await wrapper.get('input').trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('名称必填');
    await wrapper.get('input').setValue('Apple');
    await flushPromises();
    expect(wrapper.text()).not.toContain('名称必填');
  });
});
