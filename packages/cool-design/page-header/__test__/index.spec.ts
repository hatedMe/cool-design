import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PageHeader from '../index';

describe('PageHeader', () => {
  test('默认渲染返回按钮与内容', async () => {
    const wrapper = mount(PageHeader, { props: { title: '返回', content: '详情页' } });
    expect(wrapper.find('.i-page-header__back').exists()).toBe(true);
    expect(wrapper.find('.i-page-header__content').text()).toBe('详情页');
    expect(wrapper.find('.i-page-header__back').attributes('aria-label')).toBe('返回');
    await wrapper.find('.i-page-header__back').trigger('click');
    expect(wrapper.emitted('back')).toHaveLength(1);
  });

  test('icon 为空时隐藏返回按钮', () => {
    const wrapper = mount(PageHeader, { props: { icon: '', content: '无返回' } });
    expect(wrapper.find('.i-page-header__back').exists()).toBe(false);
  });

  test('自定义插槽覆盖', () => {
    const wrapper = mount(PageHeader, {
      slots: {
        icon: () => 'ICON',
        title: () => 'BACK',
        content: () => 'MAIN',
        extra: () => 'EXTRA',
        breadcrumb: () => 'CRUMB',
        default: () => 'DETAIL'
      }
    });
    expect(wrapper.text()).toContain('ICON');
    expect(wrapper.text()).toContain('BACK');
    expect(wrapper.text()).toContain('MAIN');
    expect(wrapper.text()).toContain('EXTRA');
    expect(wrapper.text()).toContain('CRUMB');
    expect(wrapper.text()).toContain('DETAIL');
  });

  test('backText 兼容', () => {
    const wrapper = mount(PageHeader, { props: { backText: '后退', content: '页' } });
    expect(wrapper.find('.i-page-header__title').text()).toBe('后退');
  });
});
