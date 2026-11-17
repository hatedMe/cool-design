import { defineComponent, computed, type PropType } from 'vue';
export interface WatermarkFont {
  color?: string;
  fontSize?: string | number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
}
const escapeXml = (value: unknown) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
/** data URI 编码：encodeURIComponent 之外补码括号等保留字符，避免 CSS url() 解析失败 */
const encodeSvg = (svg: string) =>
  encodeURIComponent(svg).replace(/[()'*!]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
export default defineComponent({
  name: 'i-watermark',
  props: {
    content: { type: [String, Array] as PropType<string | string[]>, default: '' },
    font: Object as PropType<WatermarkFont>,
    color: { type: String, default: 'rgba(0,0,0,.15)' },
    rotate: { type: Number, default: -22 },
    gap: { type: Array as unknown as PropType<[number, number]>, default: () => [100, 100] },
    zIndex: { type: Number, default: 9 }
  },
  setup(props, { slots }) {
    const text = computed(() => (Array.isArray(props.content) ? props.content.join(' ') : props.content));
    return () => {
      const font = props.font ?? {};
      const fontSize = Number(font.fontSize ?? 16);
      const height = props.gap[1] + Math.max(80, fontSize * 3);
      const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${props.gap[0] + 160}' height='${height}'>` +
        `<text x='20' y='${34 + fontSize}' fill='${escapeXml(font.color ?? props.color)}' ` +
        `transform='rotate(${props.rotate} 80 40)' font-size='${fontSize}' ` +
        `font-family='${escapeXml(font.fontFamily ?? 'sans-serif')}' ` +
        `font-weight='${escapeXml(font.fontWeight ?? 'normal')}' ` +
        `font-style='${escapeXml(font.fontStyle ?? 'normal')}'>${escapeXml(text.value)}</text></svg>`;
      return (
        <div class='i-watermark'>
          <div class='i-watermark__content'>{slots.default?.()}</div>
          <div
            class='i-watermark__layer'
            style={{
              zIndex: props.zIndex,
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeSvg(svg)}")`
            }}
          />
        </div>
      );
    };
  }
});
