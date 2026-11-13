import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Pagination from '..';

test('显示页码并发出 current-change 和 page-size-change', async () => {
  const w = mount(Pagination, {
    props: { total: 100, currentPage: 1, pageSize: 10, background: true, layout: 'total, sizes, prev, pager, next' }
  });
  await w.get('button[aria-current="page"] + button').trigger('click');
  expect(w.emitted('current-change')?.[0]).toEqual([2]);
  await w.get('select').setValue('20');
  expect(w.emitted('page-size-change')?.[0]).toEqual([20]);
  expect(w.emitted('size-change')?.[0]).toEqual([20]);
  expect(w.classes()).toContain('is-background');
});

test('单页隐藏和禁用状态不允许切换', async () => {
  const w = mount(Pagination, { props: { total: 1, hideOnSinglePage: true } });
  expect(w.find('nav').exists()).toBe(false);
  const disabled = mount(Pagination, { props: { total: 100, disabled: true } });
  await disabled.get('button[aria-label="下一页"]').trigger('click');
  expect(disabled.emitted('current-change')).toBeUndefined();
});

test('支持 page-count、jumper 跳转和 small 尺寸', async () => {
  const w = mount(Pagination, { props: { pageCount: 20, currentPage: 5, small: true } });
  expect(w.classes()).toContain('is-small');
  expect(w.findAll('.i-pagination__pager button')).toHaveLength(7);
  const jumper = w.get('.i-pagination__jumper input');
  await jumper.setValue('8');
  await jumper.trigger('change');
  expect(w.emitted('current-change')?.[0]).toEqual([8]);
});

test('layout 控制模块显示，prev-text 替换图标', async () => {
  const w = mount(Pagination, {
    props: { total: 50, layout: 'total, prev, pager, next', prevText: '上一页', nextText: '下一页' }
  });
  expect(w.text()).toContain('共 50 条');
  expect(w.get('button[aria-label="上一页"]').text()).toBe('上一页');
  expect(w.find('select').exists()).toBe(false);
  expect(w.find('.i-pagination__jumper').exists()).toBe(false);
});

test('pager-count 收敛为奇数并越界修正页码', async () => {
  const w = mount(Pagination, { props: { total: 200, currentPage: 99, pagerCount: 6 } });
  expect(w.emitted('update:currentPage')?.[0]).toEqual([20]);
  // pagerCount 6 收敛为 5：1、…、当前区、…、20
  expect(w.findAll('.i-pagination__pager button').length).toBeLessThanOrEqual(5);
});
