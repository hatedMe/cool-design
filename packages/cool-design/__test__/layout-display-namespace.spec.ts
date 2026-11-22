import { Fragment, defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import {
  Aside, Avatar, AvatarGroup, Badge, Card, CheckTag, Col, ConfigProvider, Container, Countdown,
  Descriptions, DescriptionsItem, Divider, Empty, Footer, Header, Link, Main, Result, Row,
  Skeleton, SkeletonItem, Space, Statistic, Tag, Text
} from '../index';

const layouts = [
  ['container', () => h(Container, null, () => h(Header))],
  ['header', () => h(Header)],
  ['aside', () => h(Aside)],
  ['main', () => h(Main)],
  ['footer', () => h(Footer)],
  ['row', () => h(Row)],
  ['col', () => h(Col, { span: 12 })],
  ['divider', () => h(Divider, { borderStyle: 'dashed' })],
  ['space', () => h(Space, null, () => h('span', '间距'))],
  ['text', () => h(Text, null, () => '文本')],
  ['link', () => h(Link, { href: '#details' })],
  ['badge', () => h(Badge, { value: 8, offset: [2, 3] })],
  ['tag', () => h(Tag)],
  ['check-tag', () => h(CheckTag)],
  ['avatar', () => h(Avatar, { size: 'large' })],
  ['avatar-group', () => h(AvatarGroup, null, () => h(Avatar))],
  ['card', () => h(Card)],
  ['descriptions', () => h(Descriptions, { items: [{ label: '标签', content: '内容' }] })],
  ['descriptions-item', () => h(DescriptionsItem, null, () => '独立描述项')],
  ['empty', () => h(Empty)],
  ['result', () => h(Result)],
  ['statistic', () => h(Statistic, { value: 12 })],
  ['countdown', () => h(Countdown, { value: 0 })],
  ['skeleton', () => h(Skeleton)],
  ['skeleton-item', () => h(SkeletonItem, { variant: 'circle' })]
] as const;

describe('布局与展示组件的命名空间', () => {
  test.each(layouts)('%s 响应局部 Provider 的变化', async (name, render) => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: { default: render }
    });
    try {
      expect(wrapper.find(`.acme-${name}`).exists()).toBe(true);
      expect(wrapper.find(`.i-${name}`).exists()).toBe(false);
      await wrapper.setProps({ namespace: 'brand' });
      expect(wrapper.find(`.brand-${name}`).exists()).toBe(true);
      expect(wrapper.find(`.acme-${name}`).exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  test('栅格、徽标和分隔线同步切换局部类名与样式变量', async () => {
    const namespace = ref('acme');
    const App = defineComponent({
      setup: () => () => h(ConfigProvider, { namespace: namespace.value }, () => [
        h(Row, { gutter: 16 }, () => h(Col, { span: 12, md: { span: 8, push: 2 } })),
        h(Badge, { type: 'primary', value: 8, offset: [2, 3] }),
        h(Divider, { borderStyle: 'dashed' }),
        h(ConfigProvider, { namespace: 'peer' }, () => h(Col, { span: 4 }))
      ])
    });
    const wrapper = mount(App);
    try {
      expect(wrapper.find('.acme-col-12.acme-col-md-8.acme-col-md-push-2').exists()).toBe(true);
      expect(wrapper.get('.acme-badge__tag--primary').element).toBeInstanceOf(HTMLElement);
      expect(wrapper.get('.acme-badge__tag').attributes('style')).toContain('--acme-badge-offset-x: 2px');
      expect(wrapper.get('.acme-divider').attributes('style')).toContain('--acme-divider-border-style: dashed');
      namespace.value = 'brand';
      await wrapper.vm.$nextTick();
      expect(wrapper.get('.brand-badge__tag').attributes('style')).not.toContain('--acme-badge-offset-x');
      expect(wrapper.find('.peer-col-4').exists()).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });

  test('Space 保留显式包装类、插槽分组及用户类', () => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: { default: () => h(Space, { prefixCls: 'custom', spacer: '|', class: 'user' }, () => [
        h(Fragment, null, [h('span', '甲'), h('span', '乙')]),
        h('span', '丙')
      ]) }
    });
    try {
      const space = wrapper.get('.acme-space.user');
      expect(space.findAll('.custom__item').map((item) => item.text())).toEqual(['甲乙', '丙']);
      expect(space.get('.acme-space__spacer').text()).toBe('|');
    } finally {
      wrapper.unmount();
    }
  });
});
