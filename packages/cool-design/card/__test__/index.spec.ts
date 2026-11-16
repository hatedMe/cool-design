import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Card from '..';

test('无头部时不渲染 header，属性头尾正常显示', async () => {
  const w = mount(Card, { slots: { default: () => '正文' } });
  expect(w.find('.i-card__header').exists()).toBe(false);
  expect(w.find('.i-card__footer').exists()).toBe(false);
  await w.setProps({ header: '标题', footer: '脚注' });
  expect(w.get('.i-card__header').text()).toBe('标题');
  expect(w.get('.i-card__footer').text()).toBe('脚注');
});

test('插槽优先于属性，自定义类名与 bodyStyle 生效', () => {
  const w = mount(Card, {
    props: {
      header: '属性标题',
      footer: '属性脚注',
      headerClass: 'my-header',
      bodyClass: 'my-body',
      footerClass: 'my-footer',
      bodyStyle: { padding: '8px' }
    },
    slots: { header: () => '插槽标题', footer: () => '插槽脚注', default: () => '正文' }
  });
  expect(w.get('.i-card__header').text()).toBe('插槽标题');
  expect(w.get('.i-card__footer').text()).toBe('插槽脚注');
  expect(w.get('.i-card__header').classes()).toContain('my-header');
  expect(w.get('.i-card__body').classes()).toContain('my-body');
  expect(w.get('.i-card__footer').classes()).toContain('my-footer');
  expect((w.get('.i-card__body').element as HTMLElement).style.padding).toBe('8px');
});

test.each([['always'], ['hover'], ['never']] as const)('支持 %s 阴影', (shadow) => {
  const w = mount(Card, { props: { shadow }, slots: { default: () => '正文' } });
  expect(w.get('.i-card').classes()).toContain(`is-shadow-${shadow}`);
});

test('border 兼容：默认带边框，可关闭', async () => {
  const w = mount(Card, { slots: { default: () => '正文' } });
  expect(w.get('.i-card').classes()).toContain('is-bordered');
  await w.setProps({ border: false });
  expect(w.get('.i-card').classes()).not.toContain('is-bordered');
});
