import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
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
    offset: { type: Array as unknown as PropType<[number, number]>, default: () => [0, 0] },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    zIndex: { type: Number, default: 9 }
  },
  setup(props, { slots }) {
    const ns = useNamespace('watermark');
    const rootRef = ref<HTMLElement>();
    const layerRef = ref<HTMLElement>();
    // 数组内容逐行绘制，不再拼接成单行。
    const lines = computed(() => (Array.isArray(props.content) ? props.content : [props.content]));
    const tileSize = computed(() => {
      const fontSize = Number(props.font?.fontSize ?? 16);
      const lineStep = Math.max(18, Math.round(fontSize * 1.6));
      const autoHeight =
        props.gap[1] + Math.max(80, fontSize * 3) + (Math.max(1, lines.value.length) - 1) * lineStep;
      return {
        width: props.width ?? props.gap[0] + 160,
        height: props.height ?? autoHeight,
        lineStep
      };
    });
    const backgroundImage = computed(() => `url("data:image/svg+xml;charset=utf-8,${encodeSvg(svg.value)}")`);
    const layerStyle = computed(() => ({
      zIndex: props.zIndex,
      backgroundImage: backgroundImage.value,
      backgroundPosition: `${props.offset[0]}px ${props.offset[1]}px`
    }));
    const svg = computed(() => {
      const font = props.font ?? {};
      const fontSize = Number(font.fontSize ?? 16);
      const size = tileSize.value;
      const common =
        `fill='${escapeXml(font.color ?? props.color)}' ` +
        `transform='rotate(${props.rotate} 80 40)' font-size='${fontSize}' ` +
        `font-family='${escapeXml(font.fontFamily ?? 'sans-serif')}' ` +
        `font-weight='${escapeXml(font.fontWeight ?? 'normal')}' ` +
        `font-style='${escapeXml(font.fontStyle ?? 'normal')}'`;
      const texts = lines.value
        .map((line, index) => {
          const baseline = 34 + fontSize + index * size.lineStep;
          return `<text x='20' y='${baseline}' ${common}>${escapeXml(line)}</text>`;
        })
        .join('');
      return (
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size.width}' height='${size.height}'>` +
        `${texts}</svg>`
      );
    });
    // 防篡改：水印层样式或类名被外部改动、节点被移除时，恢复到期望状态。
    // 部分环境的 CSSOM 会重排 url() 引号等序列化细节，直接与期望值比较会形成回写循环，
    // 因此记录“自身写入后的序列化值”，回调读到一致时视为自身回声直接跳过。
    let lastSerializedBackgroundImage: string | undefined;
    const restore = () => {
      const layer = layerRef.value;
      const root = rootRef.value;
      if (!layer || !root) return;
      if (layer.parentElement !== root) root.appendChild(layer);
      const layerClass = ns.e('layer');
      if (!layer.classList.contains(layerClass)) layer.classList.add(layerClass);
      if (layer.style.backgroundImage !== lastSerializedBackgroundImage) {
        layer.style.backgroundImage = layerStyle.value.backgroundImage;
        lastSerializedBackgroundImage = layer.style.backgroundImage;
      }
      if (layer.style.backgroundPosition !== layerStyle.value.backgroundPosition)
        layer.style.backgroundPosition = layerStyle.value.backgroundPosition;
      if (layer.style.zIndex !== String(props.zIndex)) layer.style.zIndex = String(props.zIndex);
    };
    let observer: MutationObserver | undefined;
    onMounted(() => {
      if (typeof MutationObserver === 'undefined') return;
      observer = new MutationObserver(restore);
      if (layerRef.value) observer.observe(layerRef.value, { attributes: true, attributeFilter: ['class', 'style'] });
      if (rootRef.value) observer.observe(rootRef.value, { childList: true });
    });
    onBeforeUnmount(() => observer?.disconnect());
    return () => (
      <div class={ns.b()} ref={rootRef}>
        <div class={ns.e('content')}>{slots.default?.()}</div>
        <div class={ns.e('layer')} ref={layerRef} style={layerStyle.value} />
      </div>
    );
  }
});
