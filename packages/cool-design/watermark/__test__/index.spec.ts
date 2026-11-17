import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

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
    expect(svg).toContain('>多行 水印<');
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
