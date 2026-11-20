import { TinyColor } from '@ctrl/tinycolor';

export type ColorFormat = 'rgb' | 'prgb' | 'hex' | 'hex3' | 'hex4' | 'hex6' | 'hex8' | 'name' | 'hsl' | 'hsv';

export const parseColor = (value: string) => {
  const { r, g, b, a } = new TinyColor(value || '#409eff').toRgb();
  return { red: r, green: g, blue: b, alpha: a };
};
export const nativeColor = (value: string) => new TinyColor(value || '#409eff').toHexString();
export const formatColor = (value: string, format: ColorFormat, alpha: number, showAlpha: boolean) => {
  const color = new TinyColor(value).setAlpha(showAlpha ? alpha : 1);
  if (format === 'rgb' && showAlpha) {
    const { r, g, b, a } = color.toRgb();
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color.toString(format === 'hex' && showAlpha && alpha < 1 ? 'hex8' : format);
};
