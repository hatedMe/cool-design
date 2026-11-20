import { withInstall } from '../../../src/utils/with-install';
import Component from './color-picker';
export interface ColorPickerInstance {
  show(): void;
  hide(): void;
  focus(): void;
  blur(): void;
}
export const ColorPicker = withInstall<typeof Component, ColorPickerInstance>(Component);
export default ColorPicker;
