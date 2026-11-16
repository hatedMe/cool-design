import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
import { nextTick } from 'vue';
import Image from '..';
import ImageViewer from '../image-viewer';

afterEach(() => {
  document.body.innerHTML = '';
});

test('加载成功触发 load，失败使用 fallback 并支持 error 插槽', async () => {
  const w = mount(Image, { props: { src: 'a.jpg', fallback: 'fallback.jpg' } });
  await w.get('img').trigger('load');
  expect(w.emitted('load')).toHaveLength(1);
  await w.get('img').trigger('error');
  expect(w.emitted('error')).toHaveLength(1);
  expect((w.get('img').element as HTMLImageElement).getAttribute('src')).toBe('fallback.jpg');
  await w.get('img').trigger('error');
  expect(w.emitted('error')).toHaveLength(2);

  const w2 = mount(Image, {
    props: { src: 'bad.jpg' },
    slots: { error: () => '加载失败' }
  });
  await w2.get('img').trigger('error');
  expect(w2.get('.i-image__error').text()).toBe('加载失败');
});

test('预览支持多图、切换、缩放旋转、进度与 showPreview', async () => {
  const urls = ['a.jpg', 'b.jpg', 'c.jpg'];
  const w = mount(Image, {
    attachTo: document.body,
    props: { src: urls[0], previewSrcList: urls, initialIndex: 1, showProgress: true }
  });
  (w.vm as unknown as { showPreview: () => void }).showPreview();
  await nextTick();
  expect(w.emitted('show')).toHaveLength(1);
  expect(document.querySelector('.i-image-viewer__mask')).not.toBeNull();
  expect(document.querySelector('.i-image-viewer__progress')?.textContent).toContain('2 / 3');
  (document.querySelector('.i-image-viewer__next') as HTMLButtonElement).click();
  await nextTick();
  expect(w.emitted('switch')).toEqual([[2]]);
  (document.querySelector('[aria-label="放大"]') as HTMLButtonElement).click();
  await nextTick();
  (document.querySelector('[aria-label="顺时针旋转"]') as HTMLButtonElement).click();
  await nextTick();
  expect((document.querySelector('.i-image-viewer__stage img') as HTMLElement).style.transform).toContain('rotate(90deg)');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await nextTick();
  expect(w.emitted('close')).toHaveLength(1);
  w.unmount();
  await flushPromises();
  expect(document.body.style.overflow).toBe('');
});

test('ImageViewer 无限循环可关闭，遮罩点击与禁用态符合预期', async () => {
  const w = mount(ImageViewer, {
    attachTo: document.body,
    props: { urlList: ['a.jpg', 'b.jpg'], infinite: false, hideOnClickModal: true }
  });
  await nextTick();
  expect((document.querySelector('.i-image-viewer__prev') as HTMLButtonElement).disabled).toBe(true);
  (document.querySelector('.i-image-viewer__mask') as HTMLElement).dispatchEvent(
    new MouseEvent('click', { bubbles: true })
  );
  expect(w.emitted('close')).toHaveLength(1);
  w.unmount();
});

test('fit 默认空值，预览占位/失败、工具栏与 teleport 转发', async () => {
  const w = mount(Image, { props: { src: 'a.jpg' } });
  expect(w.props('fit')).toBe('');
  expect((w.get('img').element as HTMLElement).style.objectFit).toBe('');
  w.unmount();

  const urls = ['a.jpg', 'b.jpg'];
  const w2 = mount(Image, {
    attachTo: document.body,
    props: { src: urls[0], previewSrcList: urls, previewTeleported: true },
    slots: {
      'viewer-placeholder': () => '预览加载中',
      'viewer-error': () => '预览失败',
      toolbar: () => '自定义工具栏',
      progress: () => '自定义进度'
    }
  });
  (w2.vm as unknown as { showPreview: () => void }).showPreview();
  await nextTick();
  // teleport 到 body，且 body 滚动锁定。
  expect(document.body.querySelector('.i-image-viewer__mask')).not.toBeNull();
  expect(document.body.style.overflow).toBe('hidden');
  expect(document.body.textContent).toContain('预览加载中');
  expect(document.body.textContent).toContain('自定义工具栏');
  const img = document.querySelector('.i-image-viewer__stage img') as HTMLImageElement;
  img.dispatchEvent(new Event('error'));
  await nextTick();
  expect(document.body.textContent).toContain('预览失败');
  w2.unmount();
  await flushPromises();
  expect(document.body.style.overflow).toBe('');
});

test('多预览实例滚动锁计数，关闭一个不解锁', async () => {
  const first = mount(ImageViewer, { attachTo: document.body, props: { urlList: ['a.jpg'] } });
  await nextTick();
  const second = mount(ImageViewer, { attachTo: document.body, props: { urlList: ['b.jpg'] } });
  await nextTick();
  expect(document.body.style.overflow).toBe('hidden');
  // setActiveItem 与 toolbar 参数包含 activeIndex。
  (first.vm as unknown as { setActiveItem: (i: number) => void }).setActiveItem(0);
  expect(first.emitted('switch')).toBeUndefined();
  first.unmount();
  expect(document.body.style.overflow).toBe('hidden');
  second.unmount();
  await flushPromises();
  expect(document.body.style.overflow).toBe('');
});

test('预览工具栏与进度插槽参数包含 activeIndex', async () => {
  let toolbarParams: Record<string, unknown> | null = null;
  let progressParams: Record<string, unknown> | null = null;
  const w = mount(ImageViewer, {
    attachTo: document.body,
    props: { urlList: ['a.jpg', 'b.jpg'], showProgress: true },
    slots: {
      toolbar: (params: Record<string, unknown>) => {
        toolbarParams = params;
        return 'tb';
      },
      progress: (params: Record<string, unknown>) => {
        progressParams = params;
        return 'pg';
      }
    }
  });
  await nextTick();
  expect(toolbarParams).toMatchObject({ activeIndex: 0 });
  expect(progressParams).toMatchObject({ activeIndex: 0, total: 2 });
  expect(typeof (toolbarParams as unknown as { setActiveItem: unknown }).setActiveItem).toBe('function');
  expect(typeof (toolbarParams as unknown as { actions: unknown }).actions).toBe('object');
  w.unmount();
});
