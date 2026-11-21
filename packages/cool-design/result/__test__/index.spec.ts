import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Result from '..';

describe('test `Result` component', () => {
  test('各状态渲染对应图标与文本', () => {
    for (const status of ['success', 'warning', 'info', 'error'] as const) {
      const wrapper = mount(Result, { props: { status, title: '标题', subTitle: '副标题' } });
      expect(wrapper.classes()).toContain(`i-result--${status}`);
      expect(wrapper.get('.i-result__title').text()).toBe('标题');
      expect(wrapper.get('.i-result__sub-title').text()).toBe('副标题');
      expect(wrapper.find('.i-result__svg').exists()).toBe(true);
      expect(wrapper.attributes('role')).toBe('status');
    }
  });

  test('异常状态页展示状态码', () => {
    const wrapper = mount(Result, { props: { status: '404', title: '页面不存在' } });
    expect(wrapper.get('.i-result__code').text()).toBe('404');
  });

  test('插槽覆盖图标、标题、副标题与操作区', () => {
    const wrapper = mount(Result, {
      slots: { icon: '图标', title: '槽标题', 'sub-title': '槽副标题', extra: '操作' }
    });
    expect(wrapper.get('.i-result__icon').text()).toBe('图标');
    expect(wrapper.get('.i-result__title').text()).toBe('槽标题');
    expect(wrapper.get('.i-result__sub-title').text()).toBe('槽副标题');
    expect(wrapper.get('.i-result__extra').text()).toBe('操作');
  });

  test('空标题时不渲染对应节点', () => {
    const wrapper = mount(Result, { props: { status: 'info' } });
    expect(wrapper.find('.i-result__title').exists()).toBe(false);
    expect(wrapper.find('.i-result__sub-title').exists()).toBe(false);
  });
});
