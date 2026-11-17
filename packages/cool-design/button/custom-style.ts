/**
 * 自定义颜色（color + dark）的样式变量计算。
 * 算法与 Element Plus `button-custom.ts` 对齐：
 * - 非 dark 模式：hover/active 向白色混合（tint）；
 * - dark 模式：hover/active 向 #141414 混合（darken）；
 * - 文字颜色按背景色明度自动取黑/白。
 * 派生色直接输出 `color-mix()`，由浏览器计算，无需颜色库。
 */
export interface ButtonCustomStyleOptions {
  dark?: boolean;
  plain?: boolean;
  text?: boolean;
  link?: boolean;
}

/** 向白色混合 percent%（对应 TinyColor#tint） */
const tint = (color: string, percent: number) => `color-mix(in srgb, ${color}, #fff ${percent}%)`;
/** 向 #141414 混合 percent%（对应 EP 的 darken） */
const darken = (color: string, percent: number) => `color-mix(in srgb, ${color}, #141414 ${percent}%)`;

const clampByte = (value: number) => Math.min(255, Math.max(0, value));

/** 解析 hex/rgb() 颜色的相对亮度（0~1），无法解析时返回 null */
const relativeLuminance = (color: string): number | null => {
  const value = color.trim();
  const hex = value.match(/^#([0-9a-f]{3,8})$/i);
  let r: number;
  let g: number;
  let b: number;
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = digits
        .slice(0, 3)
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (digits.length < 6) return null;
    r = parseInt(digits.slice(0, 2), 16);
    g = parseInt(digits.slice(2, 4), 16);
    b = parseInt(digits.slice(4, 6), 16);
  } else {
    const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (!rgb) return null;
    r = clampByte(Number(rgb[1]));
    g = clampByte(Number(rgb[2]));
    b = clampByte(Number(rgb[3]));
  }
  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export function buttonCustomStyle(
  color: string | undefined,
  { dark = false, plain = false, text = false, link = false }: ButtonCustomStyleOptions = {}
): Record<string, string> {
  if (!color) return {};
  const vars: Record<string, string> = { '--i-button-color': color };
  const activeBgColor = dark ? tint(color, 20) : darken(color, 20);
  if (text || link) {
    vars['--i-button-text-color'] = color;
    vars['--i-button-hover-text-color'] = dark ? darken(color, 30) : tint(color, 30);
    vars['--i-button-active-text-color'] = activeBgColor;
    return vars;
  }
  if (plain) {
    vars['--i-button-bg-color'] = dark ? darken(color, 90) : tint(color, 90);
    vars['--i-button-text-color'] = color;
    vars['--i-button-border-color'] = dark ? darken(color, 50) : tint(color, 50);
    vars['--i-button-hover-bg-color'] = color;
    vars['--i-button-hover-text-color'] = '#fff';
    vars['--i-button-hover-border-color'] = color;
    vars['--i-button-active-bg-color'] = activeBgColor;
    vars['--i-button-active-border-color'] = activeBgColor;
    return vars;
  }
  const hoverBgColor = dark ? darken(color, 30) : tint(color, 30);
  const luminance = relativeLuminance(color);
  const textColor = luminance === null || luminance < 0.5 ? '#fff' : '#000';
  vars['--i-button-bg-color'] = color;
  vars['--i-button-text-color'] = textColor;
  vars['--i-button-border-color'] = color;
  vars['--i-button-hover-bg-color'] = hoverBgColor;
  vars['--i-button-hover-text-color'] = textColor;
  vars['--i-button-hover-border-color'] = hoverBgColor;
  vars['--i-button-active-bg-color'] = activeBgColor;
  vars['--i-button-active-border-color'] = activeBgColor;
  return vars;
}
