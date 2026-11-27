import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
import { h, nextTick, ref } from 'vue';
import Image from '..';
import ConfigProvider from '../../config-provider';
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

test('预览支持滚轮缩放与拖拽平移', async () => {
  const w = mount(ImageViewer, {
    attachTo: document.body,
    props: { urlList: ['a.jpg'], hideOnClickModal: false }
  });
  await nextTick();
  const img = document.querySelector('.i-image-viewer__stage img') as HTMLElement;

  const wheel = (deltaY: number) => {
    (document.querySelector('.i-image-viewer__mask') as HTMLElement).dispatchEvent(
      new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })
    );
  };
  wheel(-120);
  await nextTick();
  expect(img.style.transform).toContain('scale(1.2)');
  wheel(120);
  await nextTick();
  expect(img.style.transform).toContain('scale(1)');

  // 按住拖动产生位移，松开后保留，重置后归零。
  img.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 10 }));
  document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 50, clientY: 30 }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await nextTick();
  expect(img.style.transform).toContain('translate(40px, 20px)');
  (document.querySelector('[aria-label="重置"]') as HTMLButtonElement).click();
  await nextTick();
  expect(img.style.transform).toContain('translate(0px, 0px)');
  w.unmount();
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

test.each(['content', 'stage'])('ImageViewer 在 %s 背景点击时按属性关闭', async (part) => {
  const w = mount(ImageViewer, {
    attachTo: document.body,
    props: { urlList: ['a.jpg'], hideOnClickModal: false }
  });
  const background = w.get(`.i-image-viewer__${part}`);
  const click = async () => {
    await background.trigger('pointerdown');
    await background.trigger('pointerup');
    background.element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  };
  try {
    await click();
    expect(w.emitted('close')).toBeUndefined();
    await w.setProps({ hideOnClickModal: true });
    await click();
    expect(w.emitted('close')).toHaveLength(1);
  } finally {
    w.unmount();
  }
});

test('ImageViewer 从图片拖到空白处松手时保持打开', async () => {
  const w = mount(ImageViewer, {
    attachTo: document.body,
    props: { urlList: ['a.jpg'], hideOnClickModal: true }
  });
  try {
    const content = w.get('.i-image-viewer__content');
    await w.get('img').trigger('pointerdown');
    await content.trigger('pointerup');
    content.element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(w.emitted('close')).toBeUndefined();
  } finally {
    w.unmount();
  }
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

test('Image 最近的命名空间更新时保留图片和内联预览节点', async () => {
  const namespace = ref('acme');
  const w = mount({
    setup: () => () => h(ConfigProvider, { namespace: 'outer' }, () =>
      h(ConfigProvider, { namespace: namespace.value }, () =>
        h(Image, {
          src: 'a.jpg',
          previewSrcList: ['a.jpg', 'b.jpg'],
          class: 'user-image'
        }, { placeholder: () => '加载中', error: () => '加载失败' })
      )
    )
  });
  try {
    expect(w.get('.user-image').classes()).toContain('acme-image');
    expect(w.get('.acme-image__placeholder').text()).toBe('加载中');
    const image = w.get('img');
    await image.trigger('load');
    await image.trigger('click');
    const mask = w.get('.acme-image-viewer__mask').element;
    namespace.value = 'next';
    await nextTick();
    expect(w.get('.next-image-viewer__mask').element).toBe(mask);
    expect(w.get('img').element).toBe(image.element);
    expect(w.find('.next-image__placeholder').exists()).toBe(false);
    await image.trigger('error');
    expect(w.get('.next-image__error').text()).toBe('加载失败');
  } finally {
    w.unmount();
  }
});

test('独立外置 ImageViewer 使用最近 Provider 并保留用户类和样式', async () => {
  const config = ref<{ namespace: string; theme: 'dark' | 'light'; size: 'large' | 'small' }>(
    { namespace: 'acme', theme: 'dark', size: 'large' }
  );
  const w = mount({
    setup: () => () => h(ConfigProvider, { namespace: 'outer', theme: 'light' }, () =>
      h(ConfigProvider, {
        ...config.value,
        themeVars: { '--preview-token': 'provider' }
      }, () =>
        h(ImageViewer, {
          urlList: ['a.jpg', 'b.jpg'],
          teleported: true,
          class: 'user-viewer',
          style: { '--preview-token': 'user' }
        })
      )
    )
  }, { attachTo: document.body });
  try {
    const mask = document.querySelector<HTMLElement>('.acme-image-viewer__mask');
    expect(mask?.parentElement).toBe(document.body);
    expect(mask?.classList.contains('acme-theme-scope')).toBe(true);
    expect(mask?.classList.contains('user-viewer')).toBe(true);
    expect(mask?.dataset.theme).toBe('dark');
    expect(mask?.style.getPropertyValue('--acme-control-height')).toBe('40px');
    expect(mask?.style.getPropertyValue('--preview-token')).toBe('user');

    config.value = { namespace: 'next', theme: 'light', size: 'small' };
    await nextTick();
    expect(document.querySelector('.next-image-viewer__mask')).toBe(mask);
    expect(mask?.dataset.theme).toBe('light');
    expect(mask?.style.getPropertyValue('--acme-control-height')).toBe('');
    expect(mask?.style.getPropertyValue('--next-control-height')).toBe('28px');
  } finally {
    w.unmount();
  }
  expect(document.querySelector('.user-viewer')).toBeNull();
  expect(document.body.style.overflow).toBe('');
});
