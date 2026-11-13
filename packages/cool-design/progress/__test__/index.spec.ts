import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import Progress from '..';

describe('test `Progress` component', () => {
  test('line 类型按 percentage 渲染宽度与默认文本', () => {
    const wrapper = mount(Progress, { props: { percentage: 30 } });
    expect(wrapper.classes()).toContain('i-progress');
    expect(wrapper.find('.i-progress__bar').exists()).toBe(true);
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.width).toBe('30%');
    expect(wrapper.find('.i-progress__text').text()).toBe('30%');
  });

  test('format 自定义文本，show-text 关闭隐藏文本，text-inside 内置文本', async () => {
    const wrapper = mount(Progress, {
      props: { percentage: 40, format: (p: number) => `已完成 ${p}%` }
    });
    expect(wrapper.find('.i-progress__text').text()).toBe('已完成 40%');
    await wrapper.setProps({ showText: false });
    expect(wrapper.find('.i-progress__text').exists()).toBe(false);
    await wrapper.setProps({ showText: true, textInside: true, strokeWidth: 20 });
    expect(wrapper.classes()).toContain('i-progress--text-inside');
    expect(wrapper.find('.i-progress__inner-text').text()).toBe('已完成 40%');
  });

  test('status 映射默认颜色与状态类', async () => {
    const wrapper = mount(Progress, { props: { percentage: 60, status: 'success' } });
    expect(wrapper.classes()).toContain('i-progress--success');
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.backgroundColor).toBeTruthy();
    await wrapper.setProps({ status: 'exception' });
    expect(wrapper.classes()).toContain('i-progress--exception');
    await wrapper.setProps({ status: 'warning' });
    expect(wrapper.classes()).toContain('i-progress--warning');
  });

  test('color 支持字符串、函数与分段数组', async () => {
    const wrapper = mount(Progress, { props: { percentage: 20, color: '#123456' } });
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.background).toContain('rgb(18, 52, 86)');
    await wrapper.setProps({ color: (p: number) => (p > 50 ? '#67c23a' : '#f56c6c') });
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.background).toContain(
      'rgb(245, 108, 108)'
    );
    await wrapper.setProps({ percentage: 80 });
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.background).toContain('rgb(103, 194, 58)');
    await wrapper.setProps({
      percentage: 30,
      color: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#67c23a', percentage: 80 }
      ]
    });
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.background).toContain('rgb(230, 162, 60)');
  });

  test('defineBackColor 自定义轨道色，percentage 越界时截断', async () => {
    const wrapper = mount(Progress, { props: { percentage: 50, defineBackColor: '#ebeef5' } });
    expect((wrapper.find('.i-progress__bar').element as HTMLElement).style.backgroundColor).toBeTruthy();
    await wrapper.setProps({ percentage: 130 });
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.width).toBe('100%');
    await wrapper.setProps({ percentage: -10 });
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.width).toBe('0%');
  });

  test('circle 与 dashboard 渲染 svg 并支持 width、strokeWidth、strokeLinecap', () => {
    const circle = mount(Progress, {
      props: { type: 'circle', percentage: 70, width: 120, strokeWidth: 8, strokeLinecap: 'square' }
    });
    const svg = circle.find('svg');
    expect(svg.exists()).toBe(true);
    expect(svg.attributes('width')).toBe('120');
    expect(svg.attributes('height')).toBe('120');
    expect(circle.find('.i-progress__circle-path').attributes('stroke-linecap')).toBe('square');
    expect(circle.find('.i-progress__text').text()).toBe('70%');

    const dashboard = mount(Progress, { props: { type: 'dashboard', percentage: 50 } });
    expect(dashboard.classes()).toContain('i-progress--dashboard');
    expect(dashboard.find('svg').exists()).toBe(true);
  });

  test('indeterminate、striped、stripedFlow 与 duration 生效', () => {
    const wrapper = mount(Progress, {
      props: { percentage: 50, indeterminate: true, duration: 5, striped: true, stripedFlow: true }
    });
    expect(wrapper.classes()).toContain('i-progress--indeterminate');
    expect(wrapper.find('.i-progress__inner--striped').exists()).toBe(true);
    expect(wrapper.find('.i-progress__inner--striped-flow').exists()).toBe(true);
    expect((wrapper.find('.i-progress__inner').element as HTMLElement).style.animationDuration).toBe('5s');
  });

  test('默认插槽自定义文本并接收 percentage', () => {
    const wrapper = mount(Progress, {
      props: { percentage: 66 },
      slots: { default: ({ percentage }: { percentage: number }) => `${percentage}/100` }
    });
    expect(wrapper.find('.i-progress__text').text()).toBe('66/100');
  });
});
