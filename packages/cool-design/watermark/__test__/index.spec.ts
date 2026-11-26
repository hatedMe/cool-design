import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { defineComponent, h, ref, watch } from 'vue';

import Watermark from '..';

const layerSvg = (wrapper: ReturnType<typeof mount>) => {
  const element = wrapper.find('.i-watermark__layer').element as HTMLElement;
  const raw = element.style.backgroundImage;
  expect(raw).toContain('charset=utf-8,');
  return decodeURIComponent(raw.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''));
};

describe('test `Watermark` component', () => {
  test('默认字体渲染 font-size 16 与默认颜色', () => {
    const wrapper = mount(Watermark, { props: { content: '水印' } });
    const svg = layerSvg(wrapper);
    expect(svg).toContain(`font-size='16'`);
    expect(svg).toContain(`font-family='sans-serif'`);
    expect(svg).toContain(`fill='rgba(0,0,0,.15)'`);
    expect(svg).toContain('>水印<');
  });
  test('font 属性覆盖字号、字体、字重、样式与颜色', () => {
    const wrapper = mount(Watermark, {
      props: {
        content: ['多行', '水印'],
        font: { fontSize: 24, fontFamily: 'serif', fontWeight: 600, fontStyle: 'italic', color: '#f00' }
      }
    });
    const svg = layerSvg(wrapper);
    expect(svg).toContain(`font-size='24'`);
    expect(svg).toContain(`font-family='serif'`);
    expect(svg).toContain(`font-weight='600'`);
    expect(svg).toContain(`font-style='italic'`);
    expect(svg).toContain(`fill='#f00'`);
    // 数组内容逐行绘制，不再拼接为单行。
    expect(svg).toContain('>多行<');
    expect(svg).toContain('>水印<');
    expect(svg).not.toContain('多行 水印');
    expect(svg.match(/<text/g)?.length).toBe(2);
  });
  test('width、height 与 offset 自定义水印块', () => {
    const wrapper = mount(Watermark, {
      props: { content: '水印', width: 300, height: 200, offset: [40, 30] }
    });
    const svg = layerSvg(wrapper);
    expect(svg).toContain(`width='300'`);
    expect(svg).toContain(`height='200'`);
    const layer = wrapper.find('.i-watermark__layer').element as HTMLElement;
    expect(layer.style.backgroundPosition).toBe('40px 30px');
  });
  test('首次删除水印层背景属性时恢复原图层的背景', async () => {
    const wrapper = mount(Watermark, { props: { content: '水印' }, attachTo: document.body });
    const layer = wrapper.get<HTMLElement>('.i-watermark__layer').element;
    try {
      const before = layer.style.backgroundImage;
      expect(before).toContain('data:image/svg+xml');
      layer.style.removeProperty('background-image');
      expect(layer.style.backgroundImage).toBe('');
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(layer.style.backgroundImage).toBe(before);
    } finally {
      wrapper.unmount();
    }
  });
  test('首次更新内容时恢复同批次被改回的旧背景', async () => {
    const content = ref('INITIAL');
    let layer: HTMLElement;
    let initialBackground: string;
    let patchedBackground = '';
    const Harness = defineComponent({
      setup() {
        watch(content, () => {
          patchedBackground = layer.style.backgroundImage;
          layer.style.backgroundImage = initialBackground;
        }, { flush: 'post' });
        return () => h(Watermark, { content: content.value });
      }
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      layer = wrapper.get<HTMLElement>('.i-watermark__layer').element;
      initialBackground = layer.style.backgroundImage;
      expect(initialBackground).toContain('INITIAL');
      content.value = 'UPDATED';
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(patchedBackground).toContain('UPDATED');
      expect(layer.style.backgroundImage).toBe(patchedBackground);
    } finally {
      wrapper.unmount();
    }
  });
  test('背景曾恢复后，连续更新内容仍恢复同批次被改回的旧背景', async () => {
    const content = ref('INITIAL');
    let layer: HTMLElement;
    let previousBackground: string;
    let patchedBackground = '';
    const Harness = defineComponent({
      setup() {
        watch(
          content,
          () => {
            patchedBackground = layer.style.backgroundImage;
            layer.style.backgroundImage = previousBackground;
          },
          { flush: 'post' }
        );
        return () => h(Watermark, { content: content.value });
      }
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      layer = wrapper.get<HTMLElement>('.i-watermark__layer').element;
      const initialBackground = layer.style.backgroundImage;
      layer.style.backgroundImage = 'none';
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(layer.style.backgroundImage).toBe(initialBackground);

      for (const nextContent of ['UPDATED', 'FINAL']) {
        previousBackground = layer.style.backgroundImage;
        content.value = nextContent;
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(decodeURIComponent(patchedBackground)).toContain(`>${nextContent}<`);
        expect(layer.style.backgroundImage).toBe(patchedBackground);
        expect(wrapper.get('.i-watermark__layer').element).toBe(layer);
      }
    } finally {
      wrapper.unmount();
    }
  });
  test('水印层被篡改或移除时自动恢复', async () => {
    const wrapper = mount(Watermark, { props: { content: '水印' }, attachTo: document.body });
    const layer = wrapper.find('.i-watermark__layer').element as HTMLElement;
    const before = layer.style.backgroundImage;
    layer.style.backgroundImage = 'none';
    layer.classList.remove('i-watermark__layer');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(layer.style.backgroundImage).toBe(before);
    expect(layer.classList.contains('i-watermark__layer')).toBe(true);

    layer.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(layer.parentElement).not.toBeNull();
    expect(layer.isConnected).toBe(true);
    wrapper.unmount();
  });
  test('水印内容与字体值中的特殊字符被转义', () => {
    const wrapper = mount(Watermark, {
      props: { content: '<b>&</b>', font: { fontFamily: `it's` } }
    });
    const svg = layerSvg(wrapper);
    expect(svg).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
    expect(svg).not.toContain('<b>');
  });
});
