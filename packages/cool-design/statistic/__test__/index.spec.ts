import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Statistic from '..';

describe('test `Statistic` component', () => {
  test('默认千分位分组与前后缀', () => {
    const wrapper = mount(Statistic, { props: { title: '访问量', value: 1234567, suffix: ' 次' } });
    expect(wrapper.get('.i-statistic__title').text()).toBe('访问量');
    expect(wrapper.get('.i-statistic__number').text()).toBe('1,234,567');
    expect(wrapper.get('.i-statistic__suffix').text()).toBe('次');
  });

  test('精度与自定义分隔符', () => {
    const wrapper = mount(Statistic, {
      props: { value: 1280.5, precision: 2, prefix: '¥', decimalSeparator: '.', groupSeparator: ',' }
    });
    expect(wrapper.get('.i-statistic__number').text()).toBe('1,280.50');
    expect(wrapper.get('.i-statistic__prefix').text()).toBe('¥');
    const plain = mount(Statistic, { props: { value: 1280.5, precision: 1, groupSeparator: '' } });
    expect(plain.get('.i-statistic__number').text()).toBe('1280.5');
    const negative = mount(Statistic, { props: { value: -12345 } });
    expect(negative.get('.i-statistic__number').text()).toBe('-12,345');
  });

  test('formatter 优先，非数字原样展示', () => {
    const wrapper = mount(Statistic, { props: { value: 1280, formatter: (v: string | number) => `约 ${v}` } });
    expect(wrapper.get('.i-statistic__number').text()).toBe('约 1280');
    const text = mount(Statistic, { props: { value: '暂无数据' } });
    expect(text.get('.i-statistic__number').text()).toBe('暂无数据');
    const empty = mount(Statistic, { props: { value: '' } });
    expect(empty.get('.i-statistic__number').text()).toBe('');
    const numericString = mount(Statistic, { props: { value: '12345', precision: 1 } });
    expect(numericString.get('.i-statistic__number').text()).toBe('12,345.0');
  });

  test('插槽与数值样式', () => {
    const wrapper = mount(Statistic, {
      props: { value: 98, valueStyle: { color: 'red' } },
      slots: { title: '槽标题', prefix: '约', suffix: '人' }
    });
    expect(wrapper.get('.i-statistic__title').text()).toBe('槽标题');
    expect(wrapper.get('.i-statistic__prefix').text()).toBe('约');
    expect(wrapper.get('.i-statistic__suffix').text()).toBe('人');
    expect((wrapper.get('.i-statistic__content').element as HTMLElement).style.color).toBe('red');
    const stringStyle = mount(Statistic, { props: { value: 1, valueStyle: 'color: blue;' } });
    expect((stringStyle.get('.i-statistic__content').element as HTMLElement).style.color).toBe('blue');
  });
});
