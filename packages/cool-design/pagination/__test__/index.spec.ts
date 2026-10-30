import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Pagination from '..';

test('显示页码并发出 current-change 和 page-size-change', async () => {
  const w = mount(Pagination, { props: { total: 100, currentPage: 1, pageSize: 10, background: true } });
  await w.get('button[aria-current="page"] + button').trigger('click');
  expect(w.emitted('current-change')?.[0]).toEqual([2]);
  await w.get('select').setValue('20');
  expect(w.emitted('page-size-change')?.[0]).toEqual([20]);
  expect(w.classes()).toContain('is-background');
});

test('单页隐藏和禁用状态不允许切换', async () => {
  const w = mount(Pagination, { props: { total: 1, hideOnSinglePage: true } });
  expect(w.find('nav').exists()).toBe(false);
  const disabled = mount(Pagination, { props: { total: 100, disabled: true } });
  await disabled.get('button[aria-label="下一页"]').trigger('click');
  expect(disabled.emitted('current-change')).toBeUndefined();
});
