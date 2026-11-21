import { withInstall } from '../../../src/utils/with-install';
import type { ColorPickerPanelInstance } from './types';
import Component from './color-picker-panel';
import './index.scss';

export const ColorPickerPanel = withInstall<typeof Component, ColorPickerPanelInstance>(Component);
export default ColorPickerPanel;
export type { ColorPickerPanelInstance } from './types';

export { colorPickerPanelProps, colorPickerPanelEmits } from './color-picker-panel';
export type { ColorPickerPanelProps, ColorPickerPanelEmits } from './color-picker-panel';
